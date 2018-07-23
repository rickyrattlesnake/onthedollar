Description:

Create a Single Page App consuming a Webservice via a REST API and storing data in a database, allowing users to calculate a simple tax amount estimation from a given income and a tax rates year and save them under their profile.

As a user,

●  I can authenticate

●  I can send:

○ A Superannuation percentage (>= 9.5%), ○ An income (> $0) as:

A Gross amount or,

A Gross + Superannuation amount ○ A tax rates year

●  I should see the calculated amount of:

○  The Superannuation amount,

○  The Gross amount if Gross + Superannuation has been entered,

○  The Gross + Superannuation amount if G ross has been entered,

○  The Tax amount (simple estimation excluding medicare levy or any extra),

○  The Net amount (net income received by the user after tax),

○  The Net + Superannuation amount,

●  I should be able to list and delete the history of calculations and their related tax rates.

A task should be running in background to fetch the latest tax rates from an external service (the external service can be emulated with a simple json response).

Here is an example of the Resident tax rates 2016–17 :

Taxable income

Tax on this income

0 – $18,200

Nil

$18,201 – $37,000

19c for each $1 over $18,200

$37,001 – $87,000

$3,572 plus 32.5c for each $1 over $37,000

$87,001 – $180,000

$19,822 plus 37c for each $1 over $87,000

$180,001 and over

$54,232 plus 45c for each $1 over $180,000
