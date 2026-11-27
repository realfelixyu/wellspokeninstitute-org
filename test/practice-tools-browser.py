"""Run against a local Institute preview with Python Playwright and Google Chrome.

    python3 test/practice-tools-browser.py http://127.0.0.1:5040
"""

import sys
from datetime import datetime, timezone

from playwright.sync_api import expect, sync_playwright


def stat(page, label):
    return page.get_by_text(label, exact=True).locator("..").locator("div").first


def activate(page, label):
    page.get_by_role("button", name=label, exact=True).press("Enter")


def check_tools(page, base):
    page.goto(base + "/speaking-rate-calculator", wait_until="networkidle")
    page.get_by_label("Your passage").fill("One two three four five.")
    page.clock.install(time=datetime(2026, 1, 1, tzinfo=timezone.utc))
    page.clock.pause_at(datetime(2026, 1, 1, 0, 1, tzinfo=timezone.utc))
    activate(page, "Start timer and read aloud")
    page.clock.run_for(5059)
    activate(page, "Stop")
    expect(stat(page, "time")).to_have_text("5.1 s")
    expect(stat(page, "words per minute")).to_have_text("59")
    manual = page.get_by_label("or enter seconds")
    manual.fill("2.5")
    expect(stat(page, "words per minute")).to_have_text("120")
    manual.fill("0.04")
    expect(stat(page, "time")).to_have_text("0.04 s")
    expect(stat(page, "words per minute")).to_have_text("7500")
    manual.fill("")
    expect(stat(page, "words per minute")).to_have_text("–")
    for value in ["-4", "0"]:
        manual.fill(value)
        expect(manual).to_have_attribute("aria-invalid", "true")
        expect(stat(page, "time")).to_have_text("–")
    activate(page, "Start timer and read aloud")
    expect(manual).to_have_value("")
    page.clock.run_for(2000)
    activate(page, "Stop")
    expect(stat(page, "words per minute")).to_have_text("150")

    page.goto(base + "/interview-answer-timer", wait_until="networkidle")
    page.get_by_role("combobox").select_option("7")
    for milliseconds, seconds, verdict in [
        (19500, 20, "Within this question"),
        (60200, 60, "Within this question"),
        (60600, 61, "Above the practice target"),
        (19000, 19, "Below the practice target"),
    ]:
        activate(page, "Start answering")
        page.clock.run_for(milliseconds)
        activate(page, "Done")
        expect(stat(page, "your answer")).to_have_text(f"{seconds} s")
        expect(page.get_by_text(verdict)).to_be_visible()

    page.goto(base + "/teleprompter", wait_until="networkidle")
    script = ("Talk " * 65).strip() + "\n\n" + ("Listen " * 65).strip()
    page.get_by_label("Your script").fill(script)
    box = page.locator("div.overflow-y-auto")
    position = lambda: box.evaluate("(el) => el.scrollTop / (el.scrollHeight - el.clientHeight)")
    expect(box).to_have_css("white-space", "pre-wrap")
    activate(page, "Play")
    page.clock.run_for(32)
    page.clock.fast_forward(30000)
    assert abs(position() - 0.5) < 0.014
    activate(page, "Pause")
    paused = position()
    page.clock.fast_forward(10000)
    assert position() == paused
    page.get_by_label("Text size").press("End")
    assert abs(position() - paused) < 0.014
    activate(page, "Play")
    page.clock.run_for(32)
    page.clock.fast_forward(31000)
    assert position() > 0.99
    activate(page, "Play")
    page.clock.run_for(32)
    page.clock.fast_forward(3000)
    assert 0 < position() < 0.1
    activate(page, "Back to top")
    assert position() == 0
    page.get_by_label("Your script").fill("")
    expect(page.get_by_role("button", name="Play", exact=True)).to_be_disabled()

    page.goto(base + "/filler-word-counter", wait_until="networkidle")
    transcript = "  So, you\nknow, I\tmean <draft> & kind   of, right? So we can."
    page.get_by_label("Paste a transcript of yourself speaking").fill(transcript)
    expect(stat(page, "filler words and phrases")).to_have_text("6")
    marks = page.locator("mark")
    assert marks.all_text_contents() == ["So", "you\nknow", "I\tmean", "kind   of", "right?", "So"]
    highlighted = marks.first.locator("..")
    assert highlighted.text_content() == transcript
    expect(highlighted).to_have_css("white-space", "pre-wrap")

    field = page.get_by_label("Paste a transcript of yourself speaking")
    field.fill("I—um—agree.")
    expect(stat(page, "total words")).to_have_text("3")
    expect(stat(page, "fillers per 100 words")).to_have_text("33.3")
    field.fill("Don't re-enter. We’ll check twenty‑one well-known numbers: 1,000 and 3.5. ’")
    expect(stat(page, "total words")).to_have_text("10")
    quoted = 'He said, “So I tried it.” So I agreed. She said: "So we can", so we did.'
    field.fill(quoted)
    expect(stat(page, "filler words and phrases")).to_have_text("3")
    assert marks.all_text_contents() == ["So", "So", "So"]
    assert marks.first.locator("..").text_content() == quoted


if __name__ == "__main__":
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        for path in ["/tools", "/embed"]:
            page = browser.new_page(viewport={"width": 375, "height": 800})
            check_tools(page, sys.argv[1].rstrip("/") + path)
            page.close()
        browser.close()
    print("Passed speaking-rate, interview timer, teleprompter, and transcript checks on tool and embed pages.")
