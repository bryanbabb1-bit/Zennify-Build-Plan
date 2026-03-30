# Standard: User Story Format

**Category:** Story Format
**Status:** Active

---

## Format

All user stories must follow this structure:

```
As a [persona],
I want to [action],
So that [outcome/value].
```

## Acceptance Criteria Format

Each story must have at least 3 acceptance criteria in Gherkin format:

```
Given [context/precondition],
When [action is taken],
Then [expected result].
```

## Story Point Scale

| Points | Effort |
|---|---|
| 1 | Trivial — config change, field update |
| 2 | Small — single object, simple logic |
| 3 | Medium — multiple objects, moderate logic |
| 5 | Large — complex automation or integration |
| 8 | Very Large — should be split if possible |
| 13 | Epic-level — must be broken down |

## Quality Checklist

Before a story is accepted as complete:
- [ ] Title is concise and action-oriented
- [ ] Persona is specific (e.g., "Financial Advisor" not "user")
- [ ] Outcome states business value, not just functionality
- [ ] At least 3 acceptance criteria in Gherkin format
- [ ] Story points assigned
- [ ] Salesforce objects/features tagged
- [ ] No story exceeds 8 points without being split

---
*Upload this document in the Build Planner admin panel under Standards > Story Format to inject it into all AI prompts.*
