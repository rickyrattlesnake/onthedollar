## Requirements

- single page app
- web service with REST API
- persisting to database
- tax calculations saved under profiles

- user authentication
- user income profile input:
  - superannuation % >= 9.5%
  - income > 0
  - gross or gross + super amount
  -
- user can view profiles:
  [-] superannuation amount
  [-] gross amount (if gross + super entered)
  [-] gross + super (if gross entered)
  [-] tax amount
  [-] net amount
  [-] net + super amount
- users can
  - list and delete a history of calculations
  - calculations have their related tax rates
- latest tax rates should be fetched from "external server"
  - emulate with a json file

## Todo
[-] add cors
[x] add swagger api


## Assumptions :
- assume tax rates for fiscal years before 2017 is the same as 2017
- ignores superannuation limit for low income
