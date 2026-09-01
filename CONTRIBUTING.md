# Contributing to `gsoc-contrib`

Thank you for your interest in contributing to `gsoc-contrib`! We welcome bug reports, feature suggestions, documentation improvements, and pull requests.

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## Development Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/anandmahadevv/contrib-cli.git
   cd contrib-cli
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Test Suite**:
   ```bash
   npm test
   ```

4. **Verify Dry-Run Packaging**:
   ```bash
   npm pack --dry-run
   ```

---

## Contributor Agreement (Developer Certificate of Origin)

By submitting code to this repository, you certify that:
1. The contribution was created in whole or in part by you and you have the right to submit it under the MIT License; or
2. The contribution is based on previous work that is covered under an appropriate open-source license and you have the right under that license to submit that work.
3. All contributions become part of the repository under the project's [LICENSE](LICENSE).

---

## Pull Request Guidelines

* Keep changes focused and atomic.
* Add unit tests for any new features or bug fixes under `tests/`.
* Ensure `npm test` passes cleanly.
* Maintain strict security standards (never introduce `shell: true` execution or unescaped path operations).
