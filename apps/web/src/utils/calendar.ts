export interface CalendarEvent {
    title: string;
    description: string;
    location: string;
    start: Date;
    end: Date;
}

export const generateGoogleCalendarLink = (event: CalendarEvent): string => {
    const start = event.start.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = event.end.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const url = new URL("https://www.google.com/calendar/render");
    url.searchParams.append("action", "TEMPLATE");
    url.searchParams.append("text", event.title);
    url.searchParams.append("details", event.description);
    url.searchParams.append("location", event.location);
    url.searchParams.append("dates", `${start}/${end}`);

    return url.toString();
};

export const generateOutlookCalendarLink = (event: CalendarEvent): string => {
    const start = event.start.toISOString();
    const end = event.end.toISOString();

    const url = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
    url.searchParams.append("path", "/calendar/action/compose");
    url.searchParams.append("rru", "addevent");
    url.searchParams.append("subject", event.title);
    url.searchParams.append("body", event.description);
    url.searchParams.append("location", event.location);
    url.searchParams.append("startdt", start);
    url.searchParams.append("enddt", end);

    return url.toString();
};

export const generateIcsFile = (event: CalendarEvent): string => {
    const start = event.start.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = event.end.toISOString().replace(/-|:|\.\d\d\d/g, "");

    const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${event.title}`,
        `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}`,
        `LOCATION:${event.location}`,
        "END:VEVENT",
        "END:VCALENDAR"
    ];

    return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsLines.join("\n"))}`;
};
