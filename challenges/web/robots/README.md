# Robots

| Category | Points | Flag format |
|---|---|---|
| Web | 50 | case insensitive |

## Challenge briefing
What is the second user agent NJCCIC disallows ```/``` on their website?

[NJCCIC](https://cyber.nj.gov)

## Overview
Most websites publish a `robots.txt` file at their root that tells crawlers and search engines which paths they may index. Browse to <https://cyber.nj.gov/robots.txt> and read the `User-agent:` blocks. The second crawler that is given `Disallow: /` is **Yandex** (the Russian search engine's crawler). Wrap it in the usual flag format.

## Solution
```bash
curl -s https://cyber.nj.gov/robots.txt
```

## Flag
```
njccic{Yandex}
```
(case insensitive)
