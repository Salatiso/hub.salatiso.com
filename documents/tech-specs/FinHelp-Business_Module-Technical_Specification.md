### FinHelp: Business Module \- Technical Specification

Version: 1.0  
Date: 2025-07-25  
Objective: To specify the complete functionality for the finhelp-business.js module, providing a comprehensive suite of tools for invoicing, expense tracking, and contact management for informal and small businesses.

### 1\. Core Principles & Architecture

* **Controller-Module Pattern:** finhelp.js will remain the high-level controller, responsible only for switching between the Personal and Business workspaces and initializing the respective modules. All business logic will be encapsulated within finhelp-business.js.  
* **Data Scoping:** All business-related data will be stored separately from personal data in Firestore under the path /users/{userId}/business/{businessId}/.... For this initial version, we will use a default business ID (main).  
* **Real-Time Data:** The module will use Firestore's real-time listeners (onSnapshot) to ensure that all data (invoices, bills, contacts) is always up-to-date across the interface without needing manual refreshes.  
* **Professional UI/UX:** The interface will be clean, professional, and intuitive, using modals for all data entry to keep the main views focused on displaying information.

### 2\. Firestore Data Model (/users/{userId}/business/main/)

The business data will be organized into the following collections:

* **/contacts:**  
  * { "name": "Client A", "email": "client@a.com", "type": "Customer" }  
  * { "name": "Supplier B", "phone": "082...", "type": "Supplier" }  
* **/invoices:**  
  * { "invoiceNumber": "INV-001", "customerId": "...", "customerName": "Client A", "issueDate": "timestamp", "dueDate": "timestamp", "status": "Draft/Sent/Paid/Overdue", "lineItems": \[{ "description": "Service X", "quantity": 1, "price": 500 }\], "total": 500, "isRecurring": false }  
* **/bills:**  
  * { "supplierId": "...", "supplierName": "Supplier B", "billDate": "timestamp", "dueDate": "timestamp", "status": "Unpaid/Paid", "lineItems": \[{ "description": "Material Y", "quantity": 10, "price": 50 }\], "total": 500 }

### 3\. Feature Specifications by Tab

The Business Workspace will feature a four-tab interface:

#### Tab 1: Dashboard

* **Purpose:** To provide an at-a-glance overview of the business's financial health.  
* **UI Components:**  
  * **Summary Cards:** "Overdue Invoices," "Outstanding Revenue," "Open Bills," and "30-Day Net Profit."  
  * **Charts:** A simple bar chart showing Income vs. Expenses for the last 6 months.  
* **Functions:**  
  * renderDashboardTab(): Fetches data from all collections to calculate and display the summary metrics.

#### Tab 2: Sales (Invoices & Quotes)

* **Purpose:** To create, manage, and track all customer invoices and quotes.  
* **UI Components:**  
  * A button to "Create New Invoice."  
  * A searchable, sortable table listing all invoices with status indicators (e.g., "Paid," "Overdue").  
  * Actions for each invoice: View, Edit, Mark as Sent, Mark as Paid.  
* **Functions:**  
  * renderSalesTab(): Renders the invoice list.  
  * openInvoiceModal(invoiceId): Opens a modal for creating or editing an invoice, including adding/removing line items.  
  * handleInvoiceFormSubmit(): Saves invoice data to Firestore.  
  * listenForInvoices(): Real-time listener to keep the invoice table updated.

#### Tab 3: Purchases (Bills & Expenses)

* **Purpose:** To track all money going out of the business.  
* **UI Components:**  
  * A button to "Add New Bill."  
  * A table listing all bills with their due dates and statuses.  
  * Actions for each bill: View, Edit, Mark as Paid.  
* **Functions:**  
  * renderPurchasesTab(): Renders the bill list.  
  * openBillModal(billId): Opens a modal for adding or editing a bill.  
  * handleBillFormSubmit(): Saves bill data to Firestore.  
  * listenForBills(): Real-time listener for the bills table.

#### Tab 4: Contacts

* **Purpose:** A simple CRM to manage customer and supplier information.  
* **UI Components:**  
  * A button to "Add New Contact."  
  * A table listing all contacts, filterable by "Customers" or "Suppliers."  
* **Functions:**  
  * renderContactsTab(): Renders the contact list.  
  * openContactModal(contactId): Opens a modal for adding or editing a contact.  
  * handleContactFormSubmit(): Saves contact data to Firestore.  
  * listenForContacts(): Real-time listener for the contacts table. This data will also populate dropdowns in the Invoice and Bill forms.

### 4\. Future-Ready Features (Phase 2\)

The initial build will focus on the core functionality. The following requested features will be planned for the next phase:

* **Recurring Invoices & Bills**  
* **Inventory Tracking**  
* **VAT Management**  
* **Advanced Reporting**  
* **Multi-User Roles & Permissions**