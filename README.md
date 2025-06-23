# Notion Task-to-Log Linker

This script (`linkTasksToLogs.js`) automates the process of linking completed tasks in a Notion database to their corresponding daily log entries. If a daily log for a task's date does not exist, the script will create it automatically.

## Features
- **Links completed tasks** (with status "Done") to daily log pages in Notion.
- **Creates missing daily logs** for the dates spanned by each task.
- **Supports multi-day tasks** by linking to all relevant daily logs.
- **Skips tasks** that are already linked or missing a date.

## Prerequisites
- Node.js (v14 or higher recommended)
- A Notion integration with access to your Tasks and Logs databases
- The following environment variables set in a `.env` file:
  - `NOTION_TOKEN`: Your Notion integration token
  - `TASKS_DB_ID`: The ID of your Tasks database
  - `LOGS_DB_ID`: The ID of your Daily Logs database

## Setup
1. **Clone this repository or copy the script.**
2. **Install dependencies:**
   ```bash
   npm install @notionhq/client date-fns dotenv
   ```
3. **Create a `.env` file** in the root directory with the following content:
   ```env
   NOTION_TOKEN=your_notion_integration_token
   TASKS_DB_ID=your_tasks_database_id
   LOGS_DB_ID=your_logs_database_id
   ```
   Replace the values with your actual Notion integration token and database IDs.

## Usage
Run the script with Node.js:
```bash
node linkTasksToLogs.js
```

- The script will process all tasks marked as "Done" in your Tasks database.
- For each task, it will:
  - Check if it is already linked to a daily log (via the `Task <-> Log` relation property).
  - If not, it will find or create the appropriate daily log(s) for the task's date(s).
  - Link the task to the daily log(s).

## Automate with Windows Task Scheduler
You can set up this script to run automatically every night using Windows Task Scheduler:

1. **Open Task Scheduler** (search for "Task Scheduler" in the Start menu).
2. **Create a new task**:
   - Go to **Action > Create Task...**
   - Give it a name like `Notion Daily Log Sync`.
3. **Set the trigger**:
   - Go to the **Triggers** tab and click **New...**
   - Set it to begin the task "On a schedule", and choose "Daily" at your preferred time (e.g., 2:00 AM).
4. **Set the action**:
   - Go to the **Actions** tab and click **New...**
   - Action: "Start a program"
   - Program/script: `node`
   - Add arguments: `linkTasksToLogs.js`
   - Start in: The folder where your script and `.env` file are located (e.g., `C:\Users\YourName\Desktop\notion-sync`)
5. **Save the task** and make sure your computer is on at the scheduled time.

This will ensure your Notion tasks and daily logs are synced automatically every night.

## Notion Database Requirements
- **Tasks Database:**
  - Must have a `Status` property (type: Status) with a value "Done".
  - Must have a `Date` property (type: Date).
  - Must have a relation property to the Logs database, named `Task <-> Log`.
- **Logs Database:**
  - Must have a `Date` property (type: Date).
  - Must have a `Title` property (type: Title).

## Customization
- You can adjust property names in the script if your Notion databases use different names.

## License
MIT "# Notion-Database-Auto-Linker" 
