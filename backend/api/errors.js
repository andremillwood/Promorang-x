const express = require('express');
const crypto = require('crypto');

const router = express.Router();

// In-memory store for error logs (cleared on restart)
const errorLogs = [];
const MAX_LOGS = 100;

function saveLog(log) {
    errorLogs.unshift(log);
    if (errorLogs.length > MAX_LOGS) {
        errorLogs.pop();
    }
}

/**
 * Handles error reports from EnhancedErrorBoundary / ErrorReportingService
 * Expected path: POST /api/report-error
 */
const handleReportError = (req, res) => {
    const report = req.body;
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

    const logEntry = {
        id,
        timestamp: report.timestamp || new Date().toISOString(),
        name: report.error?.name || 'Error',
        message: report.error?.message || 'No message',
        severity: 'error',
        category: 'ui',
        url: report.url || 'unknown',
        userAgent: report.userAgent || 'unknown',
        stack: report.error?.stack,
        context: report.context,
        componentStack: report.componentStack,
        user: report.user,
        status: 'open'
    };

    saveLog(logEntry);

    console.error('--- BROWSER ERROR REPORT ---');
    console.error(`ID: ${id}`);
    console.error(`Timestamp: ${logEntry.timestamp}`);
    console.error(`URL: ${logEntry.url}`);
    console.error(`Error: ${logEntry.name}: ${logEntry.message}`);
    console.error('----------------------------');

    return res.json({ success: true, message: 'Error report received', id });
};

/**
 * Handles error logs from ErrorLogger
 * Expected path: POST /api/log-error
 */
const handleLogError = (req, res) => {
    const { error, category, severity, context, tags } = req.body;
    const id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();

    const logEntry = {
        id,
        timestamp: context?.timestamp || new Date().toISOString(),
        name: error?.name || 'Error',
        message: error?.message || 'No message',
        severity: severity || 'error',
        category: category || 'unknown',
        url: context?.url || 'unknown',
        userAgent: context?.userAgent || 'unknown',
        stack: error?.stack,
        context: { ...context, tags },
        status: 'open'
    };

    saveLog(logEntry);

    console.error(`[Browser Log ${(severity || 'error').toUpperCase()}]: ${logEntry.name}: ${logEntry.message}`);

    return res.json({ success: true, id });
};

/**
 * Handles fetching logs for the admin dashboard
 * Expected path: GET /api/error-logs
 */
const handleGetLogs = (req, res) => {
    res.json(errorLogs);
};

/**
 * Handles resolving logs
 * Expected path: PATCH /api/error-logs/:id
 */
const handleResolveLog = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const log = errorLogs.find(l => l.id === id);
    if (log) {
        log.status = status || 'resolved';
        return res.json({ success: true });
    }

    res.status(404).json({ error: 'Log not found' });
};

module.exports = {
    handleReportError,
    handleLogError,
    handleGetLogs,
    handleResolveLog
};
