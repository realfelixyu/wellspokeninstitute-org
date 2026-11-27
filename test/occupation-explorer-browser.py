"""Run with Python Playwright against a built, served site: python3 test/occupation-explorer-browser.py http://localhost:5041"""

import argparse
import csv
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
            page.close()
        browser.close()
    print("Occupation explorer passed desktop and mobile browser checks.")
