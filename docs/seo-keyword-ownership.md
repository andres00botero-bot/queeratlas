# SEO Keyword Ownership

This map prevents keyword cannibalization by assigning one primary intent per landing route.

## Core Routes

| Route | Primary keyword | Secondary keywords |
| --- | --- | --- |
| `/gay-guide` | gay travel guide | gay guide, gay travel |
| `/queer-guide` | queer travel guide | queer travel, lgbtq travel guide |
| `/hbtq-guide` | hbtq guide | hbtq travel, hbtq stader |
| `/cities` | gay travel cities | queer cities, lgbtq city guides |
| `/events` | queer events | gay events, lgbtq events |

## Dynamic City Route

| Route pattern | Primary keyword template | Secondary templates |
| --- | --- | --- |
| `/[city]` | gay bars in {city} | queer nightlife {city}, lgbtq travel {city}, queer guide {city} |

## Rule

Each landing route owns one primary keyword cluster. Other routes should reference, not compete with, that exact primary phrase.
