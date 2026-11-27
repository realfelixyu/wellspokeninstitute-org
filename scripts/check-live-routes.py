"""Compare the public Institute sitemap with a candidate static export."""

import argparse
import sys
import time
from pathlib import Path
from urllib.parse import unquote, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener
from xml.etree import ElementTree


ORIGIN = "https://wellspokeninstitute.org"
ROOT = "/sitemap.xml"
NAMESPACE = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


def route_path(location):
    url = urlsplit(location)
    if (url.scheme, url.netloc) != ("https", "wellspokeninstitute.org") or url.query or url.fragment:
        raise ValueError(f"Expected a canonical Institute URL, got {location!r}")
    path = url.path or "/"
    decoded = unquote(path, errors="strict")
    if (decoded.count("/") != path.count("/") or "//" in decoded or "\\" in decoded
            or "\0" in decoded or any(part in {".", ".."} for part in decoded.split("/"))):
        raise ValueError(f"Unsupported route path in {location!r}")
    return path


def sitemap_routes(load):
    routes = set()
    visited = set()

    def visit(path):
        if path in visited:
            raise ValueError(f"Duplicate or cyclic sitemap reference: {path}")
        visited.add(path)
        try:
            root = ElementTree.fromstring(load(path))
            if root.tag == NAMESPACE + "sitemapindex":
                row_type = "sitemap"
            elif root.tag == NAMESPACE + "urlset":
                row_type = "url"
            else:
                raise ValueError(f"Unknown sitemap root {root.tag!r}")
            for row in root:
                locations = row.findall(NAMESPACE + "loc")
                if row.tag != NAMESPACE + row_type or len(locations) != 1 or not locations[0].text:
                    raise ValueError(f"Expected one location per {row_type} entry")
                target = route_path(locations[0].text.strip())
                if row_type == "url":
                    routes.add(target)
                else:
                    visit(target)
        except (ValueError, ElementTree.ParseError, OSError) as error:
            raise ValueError(f"{path}: {error}") from error

    visit(ROOT)
    if not routes:
        raise ValueError("Sitemap contains no public page URLs")
    return routes


class RejectRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError(f"Sitemap redirected to {newurl}")


def fetch_live(path, attempts=4):
    request = Request(ORIGIN + path, headers={"User-Agent": "WellspokenInstitute-ReleaseCheck/1.0"})
    for attempt in range(attempts):
        try:
            with build_opener(RejectRedirect).open(request, timeout=20) as response:
                return response.read()
        except OSError:
            if attempt == attempts - 1:
                raise
            time.sleep(5 * 2 ** attempt)


RETIRED = Path(__file__).with_name("retired-routes.txt")


def retired_routes():
    """Routes deliberately removed from the site, one path per line (# starts a comment)."""
    if not RETIRED.is_file():
        return set()
    lines = (line.split("#", 1)[0].strip() for line in RETIRED.read_text().splitlines())
    return {line for line in lines if line}


def directory_loader(directory):
    def load(path):
        return (directory / unquote(path).lstrip("/")).read_bytes()
    return load


def exported_html(directory, route):
    path = unquote(route).strip("/")
    if not path:
        return (directory / "index.html").is_file()
    if path.endswith(".html"):
        return (directory / path).is_file()
    return any((directory / name).is_file() for name in (path + ".html", path + "/index.html"))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", type=Path, default=Path("out"), help="Candidate static export")
    parser.add_argument("--live-dir", type=Path, help="Replay a saved public sitemap tree offline")
    args = parser.parse_args()
    load_live = directory_loader(args.live_dir) if args.live_dir else fetch_live
    try:
        live = sitemap_routes(load_live)
    except ValueError as error:
        sys.exit(f"Could not read public sitemap: {error}")
    try:
        staged = sitemap_routes(directory_loader(args.out))
    except ValueError as error:
        sys.exit(f"Could not read staged sitemap: {error}")

    live -= retired_routes()
    missing_sitemap = live - staged
    missing_html = {route for route in live if not exported_html(args.out, route)}
    for route in sorted(missing_sitemap):
        print(f"Missing from staged sitemap: {route}", file=sys.stderr)
    for route in sorted(missing_html):
        print(f"Missing exported HTML: {route}", file=sys.stderr)
    if missing_sitemap or missing_html:
        sys.exit(1)
    source = "saved" if args.live_dir else "live"
    print(f"All {len(live)} {source} sitemap routes have exported HTML and appear in the staged sitemap.")


if __name__ == "__main__":
    main()
