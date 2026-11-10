---
when:
  pull_request.opened: { opened_by: planner }
  pull_request.updated: { opened_by: planner }
agent: decision-checker
can:
  - add_comment
  - add_labels: [needs-human]
  # Only the recorded decisions merge alone.
  - merge_pull_request: { paths: ["migration/decisions/**"] }
---
The planner opened this pull request to record a decision. Check that its file says what a maintainer answered on the decision issue, and nothing more, then ask the engine to merge it; otherwise leave it to a person with `needs-human`.
