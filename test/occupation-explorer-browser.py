"""Run with Python Playwright against a built, served site: python3 test/occupation-explorer-browser.py http://localhost:5041"""

import argparse
import csv
import xml.etree.ElementTree as ET
from urllib.parse import urlsplit
from pathlib import Path
from tempfile import TemporaryDirectory

from playwright.sync_api import expect, sync_playwright


def check_explorer(page, url, mobile):
    page.goto(url)
    dataset = page.request.get(url + ".json").json()
    rows = dataset["rows"]
    status = page.locator('p[aria-live="polite"]')
    expect(status).to_have_text(f"Showing 50 of {len(rows)} occupations.")
    table = page.get_by_role("table")
    table_rows = table.locator("tbody tr")
    expect(table_rows).to_have_count(50)
    page.get_by_role("button", name="Show more").press("Enter")
    expect(table_rows).to_have_count(150)
    expect(status).to_have_text(f"Showing 150 of {len(rows)} occupations.")

    search = page.get_by_label("Search occupations")
    search.fill(" NURSE ")
    matches = [row for row in rows if "nurse" in row[2].lower()]
    expect(table_rows).to_have_count(len(matches))
    expect(status).to_have_text(f"Showing {len(matches)} of {len(matches)} matching occupations.")
    search.fill(rows[-1][1])
    expect(table_rows).to_have_count(1)
    expect(table_rows.first).to_contain_text(rows[-1][2])
    search.fill("no-such-occupation")
    expect(status).to_have_text("No matching occupations.")
    expect(table_rows).to_have_count(0)
    search.fill("")
    expect(table_rows).to_have_count(50)

    select = page.get_by_label("Sort by")
    for option, index in (("score", 3), ("importance", 4), ("public", 7), ("employment", 9), ("wage", 10)):
        select.select_option(option)
        for descending in (True, False):
            numeric = [row for row in rows if row[index] is not None]
            expected = sorted(numeric, key=lambda row: row[index], reverse=descending)
            direction = "descending" if descending else "ascending"
            expect(table.locator(f'th[aria-sort="{direction}"]')).to_have_count(1)
            ranks = table_rows.locator("td:first-child").all_text_contents()
            assert ranks == [str(row[0]) for row in expected[:50]], (option, direction)
            page.get_by_role("button", name="Sorted ").press("Enter")

    if mobile:
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth")
        panel = page.get_by_role("region", name="Occupation rankings")
        page.get_by_role("button", name="Sorted ").press("Tab")
        expect(panel).to_be_focused()
        panel.press("ArrowRight")
        page.wait_for_function("document.activeElement.scrollLeft > 0")

    with page.expect_download() as download:
        page.get_by_role("link", name="Download CSV").click()
    with TemporaryDirectory() as temporary:
        target = Path(temporary) / download.value.suggested_filename
        download.value.save_as(target)
        with target.open(encoding="utf-8-sig", newline="") as source:
            records = csv.DictReader(source)
            assert records.fieldnames[0] == "Rank"
            downloaded = list(records)
            assert [record["O*NET-SOC code"] for record in downloaded] == [row[1] for row in rows]
            for record in downloaded:
                assert None not in record and None not in record.values()
                assert "https://creativecommons.org/licenses/by/4.0/" in record["Source and license"]


def check_retry(page, url):
    request_url = url + ".json"
    page.route(request_url, lambda route: route.fulfill(status=503, body="Unavailable"))
    page.goto(url)
    status = page.locator('p[aria-live="polite"]')
    expect(status).to_contain_text("The full dataset could not load.")
    expect(page.get_by_role("table").locator("tbody tr")).to_have_count(50)
    page.get_by_label("Search occupations").fill("NURSE")
    expect(status).to_contain_text("matching occupation")
    page.unroute(request_url)
    page.get_by_role("button", name="Retry loading all occupations").press("Enter")
    expect(status).not_to_contain_text("Loading all occupations")
    expect(status).not_to_contain_text("could not load")
    expect(page.get_by_role("button", name="Retry loading all occupations")).to_have_count(0)
    page.get_by_label("Search occupations").fill("")
    expect(status).to_have_text("Showing 50 of 910 occupations.")


def check_guide_links(page, base):
    sitemap = ET.fromstring(page.request.get(base + "/sitemap-professions.xml").body())
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    expected = {urlsplit(item.text).path for item in sitemap.findall("s:url/s:loc", ns)
                if urlsplit(item.text).path.startswith("/professions/")}
    page.goto(base + "/data/speaking-by-occupation")
    expect(page.get_by_text("Showing 50 of 910 occupations.", exact=True)).to_be_visible()
    more = page.get_by_role("button", name="Show more")
    while more.count():
        more.click()
    links = page.get_by_role("table").get_by_role("link")
    actual = links.evaluate_all("(links) => links.map(link => link.getAttribute('href'))")
    assert expected and len(actual) == len(expected) and set(actual) == expected
    first = links.first
    target = first.get_attribute("href")
    first.press("Enter")
    expect(page).to_have_url(base + target)
    expect(page.locator("#onet-panel")).to_be_visible()


def check_lookup(page, base, route):
    url = base + "/data/speaking-by-occupation.json"
    rows = page.request.get(url).json()["rows"]
    page.route(url, lambda request: request.fulfill(status=503))
    page.goto(base + route)
    expect(page.get_by_text("The occupation data could not load.", exact=False)).to_be_visible()
    page.unroute(url)
    page.get_by_role("button", name="Try again").press("Enter")
    field = page.get_by_role("searchbox", name="Your occupation")
    ties = [r for r in rows if r[3] == 69]
    assert len(ties) > 1
    rated = [r for r in rows if r[3] is not None]
    comparison = round(100 * sum(r[3] < 69 for r in rated) / len(rated), 1)
    for row in [ties[0], ties[-1]]:
        field.fill(row[1])
        page.get_by_role("button", name=row[2], exact=True).press("Enter")
        expect(page.get_by_role("heading", name=row[2], exact=True)).to_be_focused()
        expect(page.get_by_text(f"{comparison:g}%", exact=True)).to_be_visible()
    field.fill("nonexistent occupation")
    expect(page.get_by_text("No matching occupations.")).to_be_visible()

    # The importer permits a missing composite when an underlying measure is absent.
    page.route(url, lambda request: request.fulfill(json={"rows": [
        [1,"01-0001.00","Rated occupation",70,4,4,None,None,None,None,None,None],
        [2,"01-0002.00","Missing composite",None,3,None,None,None,None,None,None,None],
    ]}))
    page.reload()
    field.fill("Missing composite")
    page.get_by_role("button", name="Missing composite").press("Enter")
    expect(page.get_by_text("A composite Speaking Demand Score is unavailable.", exact=False)).to_be_visible()
    field.fill("Rated occupation")
    page.get_by_role("button", name="Rated occupation").press("Enter")
    expect(page.get_by_text("0%", exact=True)).to_be_visible()
    page.unroute(url)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base_url")
    parser.add_argument("--channel", help="Installed Chromium channel, for example chrome")
    args = parser.parse_args()
    url = args.base_url.rstrip("/") + "/data/speaking-by-occupation"
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel=args.channel)
        for width in (1280, 375):
            page = browser.new_page(viewport={"width": width, "height": 800})
            check_explorer(page, url, mobile=width == 375)
            check_retry(page, url)
            route = "/embed/speaking-demand-lookup" if width == 375 else "/tools/speaking-demand-lookup"
            check_lookup(page, args.base_url.rstrip("/"), route)
            if width == 1280:
                check_guide_links(page, args.base_url.rstrip("/"))
            page.close()
        browser.close()
    print("Occupation explorer passed desktop and mobile browser checks.")
