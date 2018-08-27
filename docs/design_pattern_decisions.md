## Design Patterns

### Contract Design

The contract was designed similar to how a comparable database-driven application might be. Relevant data  is grouped into structs, using mappings to get individual structs as necessary.

Most functions are of the getter/setter variety: either getting a value or setting a value.

One of the design struggles I faced was returning multiple items- for instance, returning _all_ the store fronts or _all_ the products for a give store front.

I felt like there were two options:

1. Deconstruct the structs and return them as an array of tuples
2. Return an array of ids and get the individual items 1 at a time.

I opted for the latter. Network calls are pretty cheap, and network speeds are fast. Gas is not, though- and deconstructing a large array of structs could consume a lot of gas. So I opted to make multiple short network calls (for free in some cases) vs. spending my customer's money on gas to deconstruct in the EVM.