require("dotenv").config();
const { Client } = require("@notionhq/client");
const { format, addDays, isAfter } = require("date-fns");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const TASKS_DB_ID = process.env.TASKS_DB_ID;
const LOGS_DB_ID = process.env.LOGS_DB_ID;

// Utility: get array of all dates between start and end (inclusive)
function getDatesBetween(start, end) {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : startDate;
  const dates = [];

  for (
    let date = new Date(startDate);
    !isAfter(date, endDate);
    date = addDays(date, 1)
  ) {
    dates.push(format(date, "yyyy-MM-dd"));
  }

  return dates;
}
async function createDailyLogPage(dateString) {
  const response = await notion.pages.create({
    parent: { database_id: LOGS_DB_ID },
    properties: {
      "Date": {
        date: {
          start: dateString,
        },
      },
      "Title": {
        title: [
          {
            text: {
              content: `Daily Log`,
            },
          },
        ],
      },
    },
  });

  console.log(`✅ Created Daily Log for ${dateString}`);
  return response.id;
}


async function main() {
  // 1. Get all tasks with Status = Done
  const tasks = await notion.databases.query({
    database_id: TASKS_DB_ID,
    filter: {
      property: "Status",
      status: {
        equals: "Done",
      },
    },
  });

  for (const task of tasks.results) {
    const taskName = task.properties.Name?.title?.[0]?.plain_text || "Unnamed Task";
    const relationProp = task.properties["Task <-> Log"];

    // ✅ Skip if already related to at least one log
    if (relationProp?.relation?.length > 0) {
      console.log(`Skipped "${taskName}" — already linked.`);
      continue;
    }

    const dateProp = task.properties.Date;
    if (!dateProp?.date?.start) {
      console.log(`Skipped "${taskName}" — no start date.`);
      continue;
    }

    // 🗓 Get all dates task spans
    const start = dateProp.date.start;
    const end = dateProp.date.end || start;
    const spanDates = getDatesBetween(start, end);

    const relatedLogIds = [];

    for (const dateStr of spanDates) {
      // Search Daily Log for each date
      const logs = await notion.databases.query({
        database_id: LOGS_DB_ID,
        filter: {
          property: "Date",
          date: {
            equals: dateStr,
          },
        },
      });

      if (logs.results.length > 0) {
        relatedLogIds.push({ id: logs.results[0].id });
      } else {
        console.log(`⚠️ No Daily Log for ${dateStr} — creating one...`);
        const newLogId = await createDailyLogPage(dateStr);
        relatedLogIds.push({ id: newLogId });
      }
    }

    if (relatedLogIds.length === 0) {
      console.log(`No matching logs found for "${taskName}"`);
      continue;
    }

    // Update task with all related daily logs
    await notion.pages.update({
      page_id: task.id,
      properties: {
        "Task <-> Log": {
          relation: relatedLogIds,
        },
      },
    });

    console.log(`Linked "${taskName}" to logs on: ${spanDates.join(", ")}`);
  }
}

main().catch(console.error);
