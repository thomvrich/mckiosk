// Test users - Only Harry Potter and Thomas Richardson
const students = {
    '06261997': {
        firstName: 'Harry',
        lastName: 'Potter',
        id: '06261997'
    },
    '09022003': {
        firstName: 'Thomas',
        lastName: 'Richardson',
        id: '09022003'
    }
};

let currentStudent = null;
let showHours = true;
let snowEnabled = false;
let snowInterval = null;

// Backend database simulation
const database = {
    records: [],
    nextId: 1,

    addCheckIn(studentId, firstName, lastName, course) {
        const record = {
            id: this.nextId++,
            studentId: studentId,
            firstName: firstName,
            lastName: lastName,
            course: course,
            checkInTime: new Date().toISOString(),
            checkOutTime: null,
            status: 'checked-in'
        };
        this.records.push(record);
        console.log('Check-in recorded:', record);
        return record;
    },

    addCheckOut(studentId) {
        const record = this.records
            .filter(r => r.studentId === studentId && r.status === 'checked-in')
            .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))[0];
        
        if (record) {
            record.checkOutTime = new Date().toISOString();
            record.status = 'checked-out';
            console.log('Check-out recorded:', record);
            return record;
        }
        return null;
    },

    getAllRecords() {
        return this.records.sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
    },

    getCurrentlyCheckedIn() {
        return this.records.filter(r => r.status === 'checked-in');
    },

    getStudentStatus(studentId) {
        const activeRecord = this.records.find(
            r => r.studentId === studentId && r.status === 'checked-in'
        );
        return activeRecord ? 'checked-in' : 'checked-out';
    },

    clearAll() {
        this.records = [];
        this.nextId = 1;
        console.log('Database cleared');
    }
};

// Hours schedule (default)
const hoursSchedule = {
    1: "9:00 AM - 6:00 PM", // Monday
    2: "9:00 AM - 6:00 PM", // Tuesday
    3: "9:00 AM - 6:00 PM", // Wednesday
    4: "9:00 AM - 6:00 PM", // Thursday
    5: "9:00 AM - 3:00 PM", // Friday
    0: "Closed",            // Sunday
    6: "Closed"             // Saturday
};

function updateHoursDisplay() {
    const hoursDiv = document.getElementById('hoursDisplay');
    
    if (!showHours) {
        hoursDiv.style.display = 'none';
        return;
    }

    const today = new Date().getDay();
    const hours = hoursSchedule[today];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    hoursDiv.textContent = `Today's Hours (${dayNames[today]}): ${hours}`;
    hoursDiv.style.display = 'block';
}

function goToScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function showModal(modalId) {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.getElementById(modalId).classList.add('active');
}

function validateId() {
    const id = document.getElementById('soonerId').value.trim();
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));

    if (!id) {
        document.getElementById('missingInfoMessage').textContent = 'Please enter your Sooner ID.';
        showModal('modalMissingInfo');
        return;
    }

    if (id === '11223434') {
        goToScreen('screenSettings');
        document.getElementById('soonerId').value = '';
        return;
    }

    if (students[id]) {
        currentStudent = students[id];
        const status = database.getStudentStatus(id);
        
        if (status === 'checked-in') {
            database.addCheckOut(currentStudent.id);
            const m = document.createElement('div');
            m.className = 'modal active';
            m.innerHTML = '<h5>Check-out Successful</h5><p>You have been checked out successfully. Thank you!</p>';
            document.querySelector('#screenId .content').insertBefore(m, document.querySelector('#screenId .info-text'));
            setTimeout(() => {
                m.remove();
                resetForm();
            }, 2000);
        } else {
            goToScreen('screenCourse');
        }
    } else {
        showModal('modalError');
    }
}

function checkIn() {
    const c = document.getElementById('course').value;
    
    if (!c) {
        const t = document.createElement('div');
        t.className = 'modal error active';
        t.innerHTML = '<h5>Missing Information</h5><p>Please select a course.</p>';
        document.querySelector('#screenCourse .content').insertBefore(t, document.querySelector('#screenCourse .info-text'));
        setTimeout(() => t.remove(), 2000);
        return;
    }

    if (database.getStudentStatus(currentStudent.id) === 'checked-in') {
        goToScreen('screenId');
        document.getElementById('successMessage').textContent = `${currentStudent.firstName}, you are already checked in!`;
        showModal('modalSuccess');
        setTimeout(() => resetForm(), 2000);
        return;
    }

    database.addCheckIn(currentStudent.id, currentStudent.firstName, currentStudent.lastName, c);
    goToScreen('screenId');
    document.getElementById('successMessage').textContent = `Hi ${currentStudent.firstName}! You have been checked in. Thank you!`;
    showModal('modalSuccess');
    setTimeout(() => resetForm(), 2000);
}

function resetForm() {
    document.getElementById('soonerId').value = '';
    document.getElementById('soonerId').focus();
    document.getElementById('course').value = '';
    document.querySelectorAll('.course-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    currentStudent = null;
    goToScreen('screenId');
}

function saveCustomMessage() {
    const message = document.getElementById('customMessage').value.trim();
    const messageDiv = document.getElementById('customMessageDisplay');
    
    if (message) {
        messageDiv.textContent = message;
        messageDiv.classList.add('show');
    } else {
        messageDiv.classList.remove('show');
    }
}

function clearCustomMessage() {
    document.getElementById('customMessage').value = '';
    document.getElementById('customMessageDisplay').classList.remove('show');
}

function toggleHours(show) {
    showHours = show;
    updateHoursDisplay();
    
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

function saveHours() {
    hoursSchedule[1] = document.getElementById('hoursMon').value || hoursSchedule[1];
    hoursSchedule[2] = document.getElementById('hoursTue').value || hoursSchedule[2];
    hoursSchedule[3] = document.getElementById('hoursWed').value || hoursSchedule[3];
    hoursSchedule[4] = document.getElementById('hoursThu').value || hoursSchedule[4];
    hoursSchedule[5] = document.getElementById('hoursFri').value || hoursSchedule[5];
    hoursSchedule[6] = document.getElementById('hoursSat').value || hoursSchedule[6];
    hoursSchedule[0] = document.getElementById('hoursSun').value || hoursSchedule[0];
    
    updateHoursDisplay();
    alert('Hours saved successfully!');
}

function resetHoursToDefault() {
    hoursSchedule[1] = "9:00 AM - 6:00 PM";
    hoursSchedule[2] = "9:00 AM - 6:00 PM";
    hoursSchedule[3] = "9:00 AM - 6:00 PM";
    hoursSchedule[4] = "9:00 AM - 6:00 PM";
    hoursSchedule[5] = "9:00 AM - 3:00 PM";
    hoursSchedule[6] = "Closed";
    hoursSchedule[0] = "Closed";
    
    loadHoursIntoForm();
    updateHoursDisplay();
    alert('Hours reset to default!');
}

function loadHoursIntoForm() {
    document.getElementById('hoursMon').value = hoursSchedule[1];
    document.getElementById('hoursTue').value = hoursSchedule[2];
    document.getElementById('hoursWed').value = hoursSchedule[3];
    document.getElementById('hoursThu').value = hoursSchedule[4];
    document.getElementById('hoursFri').value = hoursSchedule[5];
    document.getElementById('hoursSat').value = hoursSchedule[6];
    document.getElementById('hoursSun').value = hoursSchedule[0];
}

function toggleSnow(enable) {
    snowEnabled = enable;
    
    if (enable) {
        createSnowflakes();
        snowInterval = setInterval(createSnowflakes, 800);
    } else {
        clearInterval(snowInterval);
        document.querySelectorAll('.snowflake').forEach(s => s.remove());
    }
    
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

function createSnowflakes() {
    if (!snowEnabled) return;
    
    const flake = document.createElement('div');
    flake.className = 'snowflake';
    flake.textContent = '❄';
    flake.style.left = Math.random() * 100 + '%';
    flake.style.animationDuration = Math.random() * 3 + 2 + 's';
    flake.style.opacity = Math.random();
    flake.style.fontSize = Math.random() * 15 + 15 + 'px';
    document.body.appendChild(flake);
    setTimeout(() => flake.remove(), 5000);
}

function showAllRecords() {
    const records = database.getAllRecords();
    const resultsDiv = document.getElementById('queryResults');
    const contentDiv = document.getElementById('queryContent');
    
    if (records.length === 0) {
        contentDiv.innerHTML = '<p style="color: #666;">No records found.</p>';
    } else {
        let html = '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background: #f8f9fa; font-weight: bold;"><td style="padding: 8px; border: 1px solid #ddd;">Name</td><td style="padding: 8px; border: 1px solid #ddd;">Course</td><td style="padding: 8px; border: 1px solid #ddd;">Check-In</td><td style="padding: 8px; border: 1px solid #ddd;">Check-Out</td><td style="padding: 8px; border: 1px solid #ddd;">Status</td></tr>';
        
        records.forEach(record => {
            const checkIn = new Date(record.checkInTime).toLocaleString();
            const checkOut = record.checkOutTime ? new Date(record.checkOutTime).toLocaleString() : 'N/A';
            const statusColor = record.status === 'checked-in' ? '#28a745' : '#6c757d';
            
            html += `<tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${record.firstName} ${record.lastName}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${record.course}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${checkIn}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${checkOut}</td>
                <td style="padding: 8px; border: 1px solid #ddd; color: ${statusColor}; font-weight: bold;">${record.status}</td>
            </tr>`;
        });
        
        html += '</table>';
        contentDiv.innerHTML = html;
    }
    
    resultsDiv.style.display = 'block';
}

function showCurrentlyCheckedIn() {
    const records = database.getCurrentlyCheckedIn();
    const resultsDiv = document.getElementById('queryResults');
    const contentDiv = document.getElementById('queryContent');
    
    if (records.length === 0) {
        contentDiv.innerHTML = '<p style="color: #666;">No students currently checked in.</p>';
    } else {
        let html = '<table style="width: 100%; border-collapse: collapse;">';
        html += '<tr style="background: #f8f9fa; font-weight: bold;"><td style="padding: 8px; border: 1px solid #ddd;">Name</td><td style="padding: 8px; border: 1px solid #ddd;">Course</td><td style="padding: 8px; border: 1px solid #ddd;">Check-In Time</td></tr>';
        
        records.forEach(record => {
            const checkIn = new Date(record.checkInTime).toLocaleString();
            
            html += `<tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${record.firstName} ${record.lastName}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${record.course}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${checkIn}</td>
            </tr>`;
        });
        
        html += '</table>';
        html += `<p style="margin-top: 15px; font-weight: bold; color: #28a745;">Total: ${records.length} student(s) checked in</p>`;
        contentDiv.innerHTML = html;
    }
    
    resultsDiv.style.display = 'block';
}

function clearDatabase() {
    if (confirm('Are you sure you want to clear all records? This cannot be undone.')) {
        database.clearAll();
        document.getElementById('queryResults').style.display = 'none';
        alert('All records have been cleared.');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateHoursDisplay();
    loadHoursIntoForm();
    document.getElementById('soonerId').focus();
    
    document.getElementById('soonerId').addEventListener('keypress', e => {
        if (e.key === 'Enter') validateId();
    });

    document.querySelectorAll('.course-item').forEach(i => {
        i.addEventListener('click', function() {
            document.querySelectorAll('.course-item').forEach(x => x.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('course').value = this.getAttribute('data-value');
        });
    });
});