# T03 [feature] Forms: newsletter and contact
Status: open
Blocked by: T01

Part of #1

URLs: `/contact`, footer of `/`

Decisions: 1

## Scope
- Shared form component with the fields of the newsletter (email) and contact (first name, last name, email, website, services, message), validation, success and error states, wired to nothing yet (destination configurable by one setting).
- Out: choosing a service.

## Acceptance
- [ ] pages build; `pnpm parity` passes for `/contact` at each breakpoint
- [ ] required fields as on Framer
- [ ] no request goes to Framer
