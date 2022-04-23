from io import StringIO

from lube import create_production_app

app = create_production_app()

url_docs = []

for endpoint, view_func in app.view_functions.items():
    for i in app.url_map.iter_rules():
        if i.endpoint == endpoint:
            url_docs.append((i.rule, view_func.__doc__))
            break

url_docs.sort(key=lambda x: x[0])

with open(r"web-api.md", "w", encoding="utf-8") as f:
    for url, doc in url_docs:
        print(f"# {url}", file=f)
        print(file=f)
        sio = StringIO(doc)
        for line in sio:
            if line.startswith("    "):
                print(line[4:], file=f, end="")
            else:
                print(line, file=f, end="")
        print(file=f)
