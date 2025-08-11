# ✅ Denowatts Quote Automation — Cursor Prompt in Playwright MCP Server Style

**Assignment: Automate the Denowatts quote creation and validation using Cursor.**

---

## 🔧 Run the 15 steps until all the process is completed.

1. **Use the Cursor environment to navigate to** `https://portal.denowatts.com`. All automation steps must be executed through the Cursor UI. Do not bypass the UI or simulate logic outside the user interaction scope.

2. **If this is the first time running the test**, navigate to the Sign-Up page (`https://portal.denowatts.com/signup`) and execute the following:
     - First click the Sign up button
     - Fill out the registration form with:
     - Fill input “First Name” with “Nuruddin”
     - Fill input “Last Name” with “Kawsar”
     - Fill input “Email” with “nuruddinkawsar1995@gmail.com”
     - Fill input “Password” with “Test@1234”
     - Confirm password if required and Fill input “Confirm password” with “Test@1234”
     - Fill input “Phone” with “01860458130”
   - Click button “Sign Up” or “Register”
   - Wait for account confirmation or redirect to login/dashboard
   - Set flag `account_created = true` to skip this step on future runs.

3. **Proceed to the login page** and execute the login scenario:
   - Enter the email: `nuruddinkawsar1995@gmail.com`
   - Enter the password: `Test@1234`
   - Click "Log In"
   - Validate that you are redirected to the dashboard by checking for the visibility of the `Settings` menu.

4. **Navigate to the Quote Management section:**
   - Click the “Settings” icon or menu.
   - From the navigation, choose `Quote Management > New Quote`.

5. **On the New Quote form (Page 1)**:
     - Is this project new to Denowatts? on that dropdown select Yes, this is a new project to Denowatts
     - For each **AC Nameplate value** in `[0.5, 5, 12, 40, 120]`:
     - Enter the AC Nameplate (in MW).
     - Iterate through each `Mounting Type` option.
     - For each `Module Technology` option: `Monofacial` and `Bifacial`.
     - state dropdown select Alabama 
     - Project energization year dropdown select 2025
     - Click "Next"
     - Assert that the form navigates to the hardware selection page.

6. **Validate the Hardware and Quote Summary (Page 2)**:
   - Based on the AC Nameplate value, assert correct quantities of:
     - Deno Sensors
     - Gateways
   - Use the following logic:

     ```
     AC < 1           → Sensors = 1, Gateways = 1
     1 ≤ AC < 10      → Sensors = 2, Gateways = 1
     10 ≤ AC < 25     → Sensors = 4, Gateways = 2
     25 ≤ AC < 100    → Sensors = 6, Gateways = 3
     AC ≥ 100         → Sensors = 8, Gateways = 4
     ```

   - Validate that the **quote total** recalculates correctly.

7. **Mounting Type Validation:**
   - If `Mounting Type` is `Ground (Tracker)`:
     - Assert the "Antenna Tracker Adder" appears.
     - Quantity matches sensor count.
     - Line item pricing is accurate.

8. **Module Technology Validation:**
   - If `Monofacial` is selected:
     - Assert "Deno Sensor (POA)" appears with correct count and pricing.
   - If `Bifacial` is selected:
     - Assert "Deno Sensor (POA w/ rPOA)" appears.

9. **Service Feature Validation:**
   - Select each service:
     - Basic Weather
     - Basic Monitoring
     - Advanced Energy Accounting
     - Expert Optimization Guide
   - Test with durations of **1 year** and **5 years**.
   - Assert each service appears correctly, quantity matches duration, pricing is correct.

10. **Optional Equipment and Cellular Validation:**
   - Select:
     - EPC Startup & Capacity Testing
     - Cellular Modem & Data Plans: `None`, `250MB`, `1GB`, `5GB`, `10GB`
     - Remote Access VPN
     - Outdoor Enclosure
     - Horizontal Irradiance Sensors
   - Assert:
     - Modem count = Gateway count
     - Data Plan count = service years
     - VPN visibility is correct:
       - If no data plan selected → VPN must be hidden/disabled
       - If a data plan is selected → VPN must be visible and selectable

11. **Quote Summary Dynamic Test:**
   - Change the AC Nameplate value (e.g., from 0.5 to 5).
   - Assert that:
     - Deno Sensor and Gateway counts are updated dynamically.
     - Pricing is updated live.

12. **Capture Required Screenshots:**
   - Take and save screenshots for the following test cases:
     - AC Nameplate = `0.5 MW`
     - AC Nameplate = `40 MW`
     - Any failed assertions or UI bugs

13. **Generate a Pass/Fail Test Report:**
   - For each assertion, log status as **Pass** or **Fail**.
   - Include:
     - Item name
     - Expected vs Actual quantity
     - Unit price
     - Total price (unit × quantity)
   - Save report as `report.md` or JSON.

14. **Organize your Cursor Automation Project:**
   - Create reusable selectors and actions.
   - Group tests independently — do not rely on test order.
   - Store reusable data (like email/password) in a secure config or `.env` file.
   - If code is generated, convert to **TypeScript + Cypress** and:
     - Use the **Page Object Model**
     - Place test data in `fixtures/`
     - Create a `.gitignore` to exclude `node_modules/` and sensitive env files
     - Add a `README.md` with usage instructions

15. **Run the full test flow** via Cursor, capture all outputs, and:
   - If working in code:
     - Install dependencies
     - Run tests in headless mode: `npx cypress run`
     - Setup GitHub Actions workflow to trigger tests on `master` branch
   - Push project to GitHub via MCP server path if required.

---

**Command to start in chat:**
> **Run the 15 steps until all the process is completed.**
