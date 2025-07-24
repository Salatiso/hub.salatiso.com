### FinHelp: Personal Finance Module \- Technical Specification

Version: 2.0  
Date: 2025-07-24  
Objective: To specify the complete technical and functional requirements for the finhelp-personal.js module, creating a holistic, intelligent, and user-centric financial management tool.

### 1\. Core Principles & Architecture

* **Data-Driven:** All components will be driven by a central userFinancialData object, which will be fetched from and saved to a single Firestore document (/users/{userId}/personalFinance/main).  
* **Modular Tabs:** The UI will be organized into distinct tabs. Each tab will have its own rendering function (render\[TabName\]Tab()) to ensure code is clean and maintainable.  
* **Interactive & Responsive:** All components will be fully interactive, utilizing modals for data entry and editing. The UI must be responsive and consistent with the existing site theme.  
* **Intelligence Engine:** The module will include "Intelligence" sections that provide actionable advice, reminders, and simulations based on the user's comprehensive financial data.

### 2\. Data Model (userFinancialData.personal)

The main Firestore document will contain the following structure within the personal key:

{  
  "income": \[{ "id": "", "source": "", "amount": 0, "frequency": "monthly", "date": "YYYY-MM" }\],  
  "expenses": \[{ "id": "", "category": "", "description": "", "amount": 0, "frequency": "monthly", "date": "YYYY-MM" }\],  
  "assets": \[{ "id": "", "name": "", "type": "property/investment/vehicle", "value": 0, "isLiquid": false }\],  
  "liabilities": \[{ "id": "", "name": "", "type": "bond/loan/credit\_card", "balance": 0, "limit": 0, "monthlyPayment": 0 }\],  
  "insurance": \[{ "id": "", "provider": "", "type": "life/car/home", "premium": 0, "coverage": 0, "renewalDate": "YYYY-MM-DD" }\],  
  "savingsGoals": \[{ "id": "", "name": "", "targetAmount": 0, "currentAmount": 0, "targetDate": "YYYY-MM-DD", "monthlyContribution": 0 }\],  
  "taxHistory": \[{ "year": 2024, "taxableIncome": 0, "taxPaid": 0, "refund": 0, "irb5": "base64\_string\_or\_storage\_url" }\],  
  "creditProfile": { "score": 0, "lastUpdated": "timestamp", "factors": {} },  
  "kidsFinance": \[{ "id": "", "name": "", "age": 0, "allowance": 0, "savingsGoal": { "name": "", "target": 0, "current": 0 } }\],  
  "budgets": {  
    "individual": { "categories": \[{ "name": "", "allocated": 0, "spent": 0 }\] },  
    "family": {  
      "members": \["uid1", "uid2"\],  
      "categories": \[{ "name": "", "allocated": 0, "spent": 0 }\],  
      "contributions": {  
        "financial": \[{ "memberId": "", "amount": 0, "description": "" }\],  
        "nonFinancial": \[{ "memberId": "", "task": "", "hours": 0, "value": 0 }\]  
      }  
    }  
  },  
  "documents": \[{ "id": "", "name": "", "uploadDate": "timestamp", "status": "processed", "extractedData": {} }\]  
}

### 3\. Feature Specifications by Tab

#### Tab 1: Documents (New)

* **Purpose:** The central point for data ingestion. Users can upload various documents to populate their financial profile automatically.  
* **UI Components:**  
  * A file dropzone for PDF, JPG, PNG files.  
  * A textarea for pasting bank SMS messages.  
  * A textarea for pasting raw text from statements.  
  * A list of uploaded documents showing status ("Processing", "Review Needed", "Completed").  
* **Functions:**  
  * renderDocumentsTab(): Renders the UI.  
  * handleFileUpload(files): Handles file selection. Simulates OCR by extracting dummy data based on filename (e.g., "bank\_statement.pdf").  
  * processPastedText(text, type): Handles pasted SMS or general text. Uses regex to find amounts, dates, and keywords to create transaction objects.  
  * showReviewModal(extractedData): Displays a modal with the parsed data, allowing the user to categorize, edit, and approve the entries before they are saved to the main data object.

#### Tab 2: Budgeting (New)

* **Purpose:** To create and manage budgets, including the unique ability to value and track non-financial contributions.  
* **UI Components:**  
  * Tabs for "Individual", "Family/Co-Parenting".  
  * For "Individual": A list of budget categories (e.g., Housing, Food) with allocated vs. spent amounts and progress bars.  
  * For "Family": A member selection UI. A shared budget category list. Two sections to log contributions: "Financial" (e.g., paid school fees) and "Non-Financial" (e.g., cooked meals).  
  * A summary view showing the total value contributed by each member (financial \+ non-financial).  
* **Functions:**  
  * renderBudgetingTab(): Renders the UI.  
  * openBudgetSetupModal(): Allows creation of a new budget.  
  * logFinancialContribution(): Modal form to add a financial contribution.  
  * logNonFinancialContribution(): Modal form to add a non-financial task. It will have fields for "Task" and "Hours spent".  
  * calculateNonFinancialValue(hours): A helper function that returns hours \* SA\_MINIMUM\_WAGE\_HOURLY.

#### Tab 3: Insurance

* **Purpose:** To provide a comprehensive overview of all insurance policies and offer intelligent advice.  
* **UI Components:**  
  * A list of insurance policies grouped by type (Life, Car, Home, etc.).  
  * A button to "Add New Policy" which opens a modal.  
  * An "Insurance Intelligence" section with actionable advice cards.  
* **Functions:**  
  * renderInsuranceTab(): Renders the UI.  
  * openAddInsuranceModal(policyToEdit): Modal for adding or editing a policy.  
  * generateInsuranceAdvice(): Analyzes all policies to generate tips (e.g., "Your car insurance renewal is in 30 days. It's a good time to shop for quotes.").

#### Tab 4: Savings Goals

* **Purpose:** To enable users to set, track, and manage their financial goals.  
* **UI Components:**  
  * Cards for each savings goal showing name, progress bar, target amount, and days left.  
  * A button to "Add New Goal".  
* **Functions:**  
  * renderSavingsGoalsTab(): Renders the UI.  
  * openAddGoalModal(goalToEdit): Modal for adding/editing a goal.  
  * checkGoalProgress(): A function that runs on load to check if any goals are off-track and trigger notifications.

#### Tab 5: Tax Management

* **Purpose:** To simplify tax preparation and provide historical analysis.  
* **UI Components:**  
  * A summary of the current tax year's estimated liability.  
  * A button to "Generate SARS eFiling Document".  
  * A list of historical tax years with key figures.  
  * A "Tax Impact Simulator" section.  
* **Functions:**  
  * renderTaxManagementTab(): Renders the UI.  
  * generateSarsDocument(): Compiles all income and deductible expenses into a structured object that mirrors the ITR12 form fields, which the user can then copy.  
  * renderTaxImpactSimulator(): A fun, visual component showing how the user's annual tax contribution is hypothetically distributed across national budget categories (e.g., Health, Education).

#### Tab 6: Calculators

* **Purpose:** To provide a suite of financial calculators that can use both simulated and the user's actual data.  
* **UI Components:**  
  * A grid of available calculators (Home Loan, Retirement, Investment Growth, Debt Consolidation).  
  * Each calculator modal will have a checkbox: "Use my actual financial data". When checked, relevant fields (income, expenses) are auto-filled and disabled from editing.  
  * **UI Improvement:** All input fields within calculators will be visually distinct with clear borders and labels, placed inside styled containers for contrast.  
* **Functions:**  
  * renderCalculatorsTab(): Renders the main grid.  
  * openCalculatorModal(calculatorType): Opens the relevant calculator.  
  * populateWithActualData(form): Fills the calculator's form with data from userFinancialData.

#### Tab 7: Credit Profile

* **Purpose:** To help users understand and improve their credit score.  
* **UI Components:**  
  * A large visual gauge displaying the calculated credit score.  
  * A section with "Improvement Tips".  
  * A "Score Simulator" where users can change variables (e.g., "What if I reduce my credit card balance by R5,000?") and see the potential impact on their score.  
* **Functions:**  
  * renderCreditProfileTab(): Renders the UI.  
  * calculateCreditScore(data): A comprehensive function that takes financial data as input and returns a score from 300-850 based on factors like payment history, credit utilization, and debt-to-income ratio.  
  * runCreditSimulation(): Recalculates the score based on user inputs in the simulator section.

#### Tab 8: Kids Dashboard

* **Purpose:** A simplified, engaging interface for teaching children basic financial concepts.  
* **UI Components:**  
  * A card for each child with their name, age, and a fun avatar/emoji.  
  * Each card will show:  
    * "My Pocket Money": R\[allowance\]  
    * "My Savings Goal": A progress bar for their goal (e.g., "New Bicycle").  
  * Simple buttons for "Add Pocket Money" and "Add to Savings".  
* **Functions:**  
  * renderKidsDashboardTab(): Renders the UI.  
  * openAddChildModal(childToEdit): Modal to add or edit a child's profile.  
  * handleChildTransaction(childId, type, amount): A function to add allowance or savings for a specific child.