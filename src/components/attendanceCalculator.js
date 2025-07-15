export const calculateSubjectAttendancePercentage = (presentCount, totalSessions) => {
    if (!totalSessions || totalSessions === 0) {
        return 0;
    }
    const percentage = (presentCount / totalSessions) * 100;
    return Number(percentage.toFixed(1)); // Return as number with one decimal
};

export const groupAttendanceBySubject = (subjectAttendance) => {
    if (!Array.isArray(subjectAttendance)) {
        return {};
    }

    const attendanceBySubject = {};

    subjectAttendance.forEach((attendance) => {
        if (!attendance.subName || !attendance.subName.subName) {
            return;
        }

        const subName = attendance.subName.subName;
        const sessions = attendance.subName.sessions || 0;
        const subId = attendance.subName._id;

        if (!attendanceBySubject[subName]) {
            attendanceBySubject[subName] = {
                present: 0,
                absent: 0,
                sessions: sessions,
                allData: [],
                subId: subId
            };
        }
        
        if (attendance.status === "Present") {
            attendanceBySubject[subName].present++;
        } else if (attendance.status === "Absent") {
            attendanceBySubject[subName].absent++;
        }
        
        attendanceBySubject[subName].allData.push({
            date: attendance.date,
            status: attendance.status,
        });
    });
    
    return attendanceBySubject;
};

export const calculateOverallAttendancePercentage = (subjectAttendance) => {
    if (!Array.isArray(subjectAttendance) || subjectAttendance.length === 0) {
        return 0;
    }

    const subjectTotals = {};
    let totalPresent = 0;
    let totalSessions = 0;

    // First pass: collect subject-wise data
    subjectAttendance.forEach((attendance) => {
        if (!attendance.subName || !attendance.subName._id) return;

        const subId = attendance.subName._id;
        if (!subjectTotals[subId]) {
            subjectTotals[subId] = {
                sessions: attendance.subName.sessions || 0,
                present: 0,
                total: 0
            };
        }

        subjectTotals[subId].total++;
        if (attendance.status === "Present") {
            subjectTotals[subId].present++;
        }
    });

    // Calculate totals
    Object.values(subjectTotals).forEach(subject => {
        if (subject.total > 0) {
            totalPresent += subject.present;
            totalSessions += subject.total;
        }
    });

    if (totalSessions === 0) {
        return 0;
    }

    return Number(((totalPresent / totalSessions) * 100).toFixed(1));
};