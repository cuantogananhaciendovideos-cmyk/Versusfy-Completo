# Versusfy Security Specification

## Data Invariants
1. **Trending Comparisons**: Only system-generated (or admin) can create/update. Public can read.
2. **Trending Votes**: Public can increment `likes` by exactly 1. Public can increment `ratingCount` and `totalRating`.
3. **Comparisons**: Primary app logic. Anyone can read, only valid shapes can be created.

## The Dirty Dozen (Attack Scenarios)
1. **ID Poisoning**: Attempt to create a document with a 2MB string as ID.
2. **Mass Update**: Attempt to update `likes` from 0 to 1,000,000 in one write.
3. **Ghost Field Injection**: Add `isVerified: true` to a trending vote to gain privileges.
4. **Identity Spoofing**: Set `userId` to another user's UID in `shopping_desires`.
5. **Rating Deletion**: Negative stars or resetting `totalVotes`.
6. **Schema Break**: Send `text` as an integer instead of a string in `comparisons`.
7. **Recursive Write**: Attempting to trigger infinite loops (not directly possible but logic-wise).
8. **PII Leak**: Reading `visitors` data without proper auth (if it contained sensitive info).
9. **Role Escalation**: Setting `isAdmin: true` on a user document.
10. **Timestamp Fraud**: Providing a client-side `createdAt` from the future.
11. **Relational Orphan**: Creating a sub-resource without a parent.
12. **Blanket List Scraping**: Querying all collections without filters.

## Test Runner (Logic)
- All writes without authentication (where required) -> DENIED.
- All writes with invalid schema -> DENIED.
- All writes exceeding size limits -> DENIED.
