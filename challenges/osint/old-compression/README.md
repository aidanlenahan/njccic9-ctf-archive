# Old Compression, Older Mistakes

| Category | Points | Flag format |
|---|---|---|
| OSINT | 40 | case sensitive |

## Challenge briefing
A vulnerability reported before 2015 affected a messaging service from Novell. It could be exploited remotely by sending an unusually long Accept-Language header to its default port. Find the CVE entry and extract the necessary information to form the flag. The flag contains the last four digits of the CVE number, a hyphen, as well as the exploited port number.

Example: ```njccic{0751-8080}```, first four digits from CVE-2010-0751, next four digits representing port 8080

## Overview
Searching for *Novell messenger Accept-Language overflow* leads to **CVE-2006-0992**: a stack-based buffer overflow in Novell GroupWise Messenger before 2.0 Public Beta 2. A remote attacker can run arbitrary code with SYSTEM privileges by sending an HTTP request with an overly long `Accept-Language` value (no comma or semicolon) to the messenger's default port, **8300**.

The original ZDI advisory has a typo and cites CVE-2006-0092, but 0992 is the correct identifier.

## Sources
- [NIST NVD: CVE-2006-0992](https://nvd.nist.gov/vuln/detail/CVE-2006-0992)
- [IBM X-Force Exchange](https://exchange.xforce.ibmcloud.com/vulnerabilities/25828)
- [Zero Day Initiative: ZDI-06-008](https://www.zerodayinitiative.com/advisories/ZDI-06-008/)

## Flag
```
njccic{0992-8300}
```
