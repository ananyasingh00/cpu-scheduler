let processes = [];

const processColors = {
  P1: "#ff0000",   // Vivid Red
  P2: "#00e1ffff",   // Vivid Blue
  P3: "#00ff00",   // Neon Green
  P4: "#ffff00",   // Bright Yellow
  P5: "#ff8000",   // Fluorescent Orange
  P6: "#8000ff",   // Electric Purple
  P7: "#ff00ff",   // Hot Pink
  P8: "#00ffff"    // Bright Cyan
};

// Algorithm insights data
const algoInsights = {
  FCFS: {
    title: "✿ First Come First Serve (FCFS)",
    desc: "First Come First Serve: Non-preemptive. Executes processes in order of arrival. Simple but can cause long wait times.",
    time: "O(n)",
    use: "Simple batch systems",
    adv: [
      "Easy to implement",
      "Fair for simple tasks",
      "Minimal overhead"
    ],
    disadv: [
      "Long wait for big tasks",
      "Inefficient wait times",
      "Convoy effect"
    ]
  },
  SJF: {
    title: "✿ Shortest Job First (SJF)",
    desc: "Shortest Job First: Non-preemptive. Chooses the process with the shortest burst time. Efficient but can starve longer jobs.",
    time: "O(n log n)",
    use: "Batch systems with predictable burst times",
    adv: [
      "Optimal average waiting time",
      "Good for batch workloads",
      "Minimizes completion time"
    ],
    disadv: [
      "Starvation of long processes",
      "Requires burst time prediction",
      "Not suitable for interactive systems"
    ]
  },
  SRTF: {
    title: "✿ Shortest Remaining Time First (SRTF)",
    desc: "Shortest Remaining Time First: Preemptive version of SJF. Always picks the process with the least remaining time.",
    time: "O(n log n)",
    use: "Real-time systems with short tasks",
    adv: [
      "Responsive to short processes",
      "Efficient CPU usage",
      "Minimizes turnaround time"
    ],
    disadv: [
      "Frequent context switches",
      "Starvation of long tasks",
      "Requires accurate burst estimates"
    ]
  },
  RR: {
    title: "✿ Round Robin (RR)",
    desc: "Round Robin: Preemptive. Each process gets a fixed time slice (quantum). Fair for all, good for time-sharing systems.",
    time: "O(n*q)",
    use: "Interactive and time-sharing systems",
    adv: [
      "Fair time allocation",
      "Responsive for short tasks",
      "Avoids starvation"
    ],
    disadv: [
      "High context switching overhead",
      "Poor for long tasks",
      "Quantum size tuning required"
    ]
  },
  PriorityNP: {
    title: "✿ Priority Scheduling (Non-Preemptive)",
    desc: "Priority Scheduling (Non-Preemptive): Executes highest priority process first. Lower priority may wait longer.",
    time: "O(n log n)",
    use: "Systems with static priority rules",
    adv: [
      "Simple priority control",
      "Efficient for critical tasks",
      "Easy to implement"
    ],
    disadv: [
      "Starvation of low-priority tasks",
      "No dynamic adjustment",
      "Can be unfair without aging"
    ]
  },
  PriorityP: {
    title: "✿ Priority Scheduling (Preemptive)",
    desc: "Priority Scheduling (Preemptive): Interrupts running process if a higher priority one arrives.",
    time: "O(n log n)",
    use: "Real-time systems with strict priority needs",
    adv: [
      "Immediate response for high-priority tasks",
      "Dynamic task control",
      "Supports aging to reduce starvation"
    ],
    disadv: [
      "Complex implementation",
      "Starvation of low-priority tasks",
      "Priority inversion risk"
    ]
  }
};

// Function to update the insights panel
function updateAlgoDetails(algoKey) {
  const info = algoInsights[algoKey];
  if (!info) return;

  document.getElementById("algoTitle").textContent = info.title;
  document.getElementById("algoDesc").textContent = info.desc;
  document.getElementById("algoTime").textContent = info.time;
  document.getElementById("algoUse").textContent = info.use;

  const advList = document.getElementById("algoAdv");
  const disadvList = document.getElementById("algoDisadv");
  advList.innerHTML = "";
  disadvList.innerHTML = "";

  info.adv.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    advList.appendChild(li);
  });

  info.disadv.forEach(text => {
    const li = document.createElement("li");
    li.textContent = text;
    disadvList.appendChild(li);
  });
}

// Event listener for dropdown change
document.getElementById("algorithm").addEventListener("change", function () {
  updateAlgoDetails(this.value);
});

// Show FCFS by default on page load
document.addEventListener("DOMContentLoaded", () => {
  updateAlgoDetails("FCFS");
});



function getColorForProcess(pname) {
  return processColors[pname] || "#888"; // fallback color
}

document.getElementById("addProcessForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const pname = document.getElementById("pname").value;
  const arrival = parseInt(document.getElementById("arrival").value);
  const burst = parseInt(document.getElementById("burst").value);
  const priority = parseInt(document.getElementById("priority").value);

  processes.push({ pname, arrival, burst, priority });
  displayProcesses();
});

function displayProcesses() {
  const list = document.getElementById("processList");
  list.innerHTML = "";

  processes.forEach((p, index) => {
    const div = document.createElement("div");
    div.className = "process-entry";
    div.innerHTML = `
      ${p.pname} - AT:${p.arrival}, BT:${p.burst}, P:${p.priority}
      <button onclick="deleteProcess(${index})" class="delete-btn" title="Delete">
        <img src="de.png" alt="Delete" class="delete-icon">
      </button>
    `;
    list.appendChild(div);
  });
}


function deleteProcess(index) {
  processes.splice(index, 1); // Remove from array
  displayProcesses();         // Re-render list
}


function runScheduler() {
  document.getElementById("gantt-chart").classList.remove("hidden");
  document.getElementById("results").classList.remove("hidden");
  document.getElementById("metrics").classList.remove("hidden");
  const algo = document.getElementById("algorithm").value;
  if (algo === "FCFS") runFCFS();
  else if (algo === "SJF") runSJF();
  else if (algo === "SRTF") runSRTF();
  else if (algo === "RR") runRR();
  else if (algo === "PriorityNP") runPriorityNP();
  else if (algo === "PriorityP") runPriorityP();
}

function resetUI() {
  document.getElementById("chart").innerHTML = "";
  document.querySelector("#resultsTable tbody").innerHTML = "";
}

function animateMetric(id) {
  const el = document.getElementById(id);
  el.style.transform = "scale(1.1)";
  setTimeout(() => {
    el.style.transform = "scale(1)";
  }, 300);
}

function updateMetrics(results) {
  const n = results.length;
  const totalWT = results.reduce((sum, p) => sum + p.waiting, 0);
  const totalTAT = results.reduce((sum, p) => sum + p.turnaround, 0);
  const totalRT = results.reduce((sum, p) => sum + p.response, 0);
  const lastCompletion = Math.max(...results.map(p => p.completion));
  const totalBurst = results.reduce((sum, p) => sum + p.burst, 0);

  const metrics = {
    avgWT: (totalWT / n).toFixed(2),
    avgTAT: (totalTAT / n).toFixed(2),
    avgRT: (totalRT / n).toFixed(2),
    cpuUtil: ((totalBurst / lastCompletion) * 100).toFixed(2) + "%"
  };

  for (const key in metrics) {
    const el = document.getElementById(key);
    el.textContent = `${el.textContent.split(":")[0]}: ${metrics[key]}`;
    animateMetric(key);
  }
}

function renderChart(results) {
  const chart = document.getElementById("chart");
  chart.innerHTML = "";
  results.forEach(p => {
    const block = document.createElement("div");
    block.className = "block";
    block.innerHTML = `${p.pname}<br>${p.start}-${p.completion}`;
    block.style.backgroundColor = getColorForProcess(p.pname);
    block.style.color = "#000";
    chart.appendChild(block);
  });
}

function renderChartFromTimeline(timeline) {
  const chart = document.getElementById("chart");
  chart.innerHTML = "";

  let current = timeline[0], start = 0;

  for (let i = 1; i <= timeline.length; i++) {
    if (timeline[i] !== current) {
      const block = document.createElement("div");
      block.className = current === "Idle" ? "block idle" : "block";
      block.innerHTML = `${current}<br>${start}-${i}`;

      if (current !== "Idle") {
        block.style.backgroundColor = getColorForProcess(current);
        block.style.color = "#000";
      }

      chart.appendChild(block);
      current = timeline[i];
      start = i;
    }
  }
}


function renderTable(results) {
  const tbody = document.querySelector("#resultsTable tbody");
  results.forEach(p => {
    tbody.innerHTML += `<tr>
      <td>${p.pname}</td><td>${p.arrival}</td><td>${p.burst}</td><td>${p.priority}</td>
      <td>${p.start}</td><td>${p.completion}</td><td>${p.turnaround}</td>
      <td>${p.waiting}</td><td>${p.response}</td>
    </tr>`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loadSampleBtn").addEventListener("click", loadSampleData);
});



function loadSampleData() {
  processes = [];
  for (let i = 1; i <= 6; i++) {
    const arrival = Math.floor(Math.random() * 5);       // 0–4
    const burst = Math.floor(Math.random() * 8) + 1;      // 1–8
    const priority = Math.floor(Math.random() * 5) + 1;   // 1–5
    processes.push({ pname: `P${i}`, arrival, burst, priority });
  }
  resetUI();
  displayProcesses();
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loadSampleBtn").addEventListener("click", loadSampleData);
  document.getElementById("resetBtn").addEventListener("click", resetAll);
});

function resetAll() {
  processes = [];
  resetUI();
  displayProcesses();
  document.getElementById("gantt-chart").classList.add("hidden");
  document.getElementById("results").classList.add("hidden");
  document.getElementById("metrics").classList.add("hidden");
}

const algoDescriptions = {
  FCFS: "First Come First Serve: Non-preemptive. Executes processes in order of arrival. Simple but can cause long wait times.",
  SJF: "Shortest Job First: Non-preemptive. Chooses the process with the shortest burst time. Efficient but can starve longer jobs.",
  SRTF: "Shortest Remaining Time First: Preemptive version of SJF. Always picks the process with the least remaining time.",
  RR: "Round Robin: Preemptive. Each process gets a fixed time slice (quantum). Fair for all, good for time-sharing systems.",
  PriorityNP: "Priority Scheduling (Non-Preemptive): Executes highest priority process first. Lower priority may wait longer.",
  PriorityP: "Priority Scheduling (Preemptive): Interrupts running process if a higher priority one arrives."
};

document.getElementById("algorithm").addEventListener("change", function () {
  const selected = this.value;
  document.getElementById("algoDescription").textContent = algoDescriptions[selected] || "";
});


// FCFS
function runFCFS() {
  resetUI();
  const sorted = [...processes].sort((a, b) => a.arrival - b.arrival);
  let time = 0;
  const results = [];

  sorted.forEach(p => {
    const start = Math.max(time, p.arrival);
    const completion = start + p.burst;
    const turnaround = completion - p.arrival;
    const waiting = turnaround - p.burst;
    const response = waiting;

    results.push({ ...p, start, completion, turnaround, waiting, response });
    time = completion;
  });

  renderChart(results);
  renderTable(results);
  updateMetrics(results);
}

// SJF
function runSJF() {
  resetUI();
  const queue = [...processes];
  let time = 0;
  const results = [];

  while (queue.length) {
    const available = queue.filter(p => p.arrival <= time);
    const next = available.length
      ? available.reduce((a, b) => (a.burst < b.burst ? a : b))
      : queue.reduce((a, b) => (a.arrival < b.arrival ? a : b));

    const start = Math.max(time, next.arrival);
    const completion = start + next.burst;
    const turnaround = completion - next.arrival;
    const waiting = turnaround - next.burst;
    const response = waiting;

    results.push({ ...next, start, completion, turnaround, waiting, response });
    time = completion;
    queue.splice(queue.indexOf(next), 1);
  }

  renderChart(results);
  renderTable(results);
  updateMetrics(results);
}

// SRTF
function runSRTF() {
  resetUI();
  const queue = processes.map(p => ({ ...p, remaining: p.burst }));
  let time = 0;
  const results = [];
  const timeline = [];

  while (queue.some(p => p.remaining > 0)) {
    const available = queue.filter(p => p.arrival <= time && p.remaining > 0);
    const current = available.length
      ? available.reduce((a, b) => (a.remaining < b.remaining ? a : b))
      : null;

    if (current) {
      if (!current.started) {
        current.start = time;
        current.started = true;
      }
      current.remaining--;
      timeline.push(current.pname);
      if (current.remaining === 0) {
        current.completion = time + 1;
        current.turnaround = current.completion - current.arrival;
        current.waiting = current.turnaround - current.burst;
        current.response = current.start - current.arrival;
        results.push(current);
      }
    } else {
      timeline.push("Idle");
    }
    time++;
  }

  renderChartFromTimeline(timeline);
  renderTable(results);
  updateMetrics(results);
}


// Round Robin
function runRR() {
  resetUI();
  const quantum = parseInt(document.getElementById("quantum").value);
  const queue = processes.map(p => ({ ...p, remaining: p.burst }));
  let time = 0;
  const timeline = [];
  const results = [];
  const readyQueue = [];

  while (queue.some(p => p.remaining > 0)) {
    queue.forEach(p => {
      if (p.arrival <= time && !readyQueue.includes(p) && p.remaining > 0) {
        readyQueue.push(p);
      }
    });

    if (readyQueue.length === 0) {
      timeline.push("Idle");
      time++;
      continue;
    }

    const current = readyQueue.shift();
    if (!current.started) {
      current.start = time;
      current.started = true;
    }

    const execTime = Math.min(quantum, current.remaining);
    for (let i = 0; i < execTime; i++) {
      timeline.push(current.pname);
    }

    time += execTime;
    current.remaining -= execTime;

    queue.forEach(p => {
      if (p.arrival <= time && !readyQueue.includes(p) && p.remaining > 0) {
        readyQueue.push(p);
      }
    });

    if (current.remaining > 0) {
      readyQueue.push(current);
    } else {
      current.completion = time;
      current.turnaround = current.completion - current.arrival;
      current.waiting = current.turnaround - current.burst;
      current.response = current.start - current.arrival;
      results.push(current);
    }
  }

  renderChartFromTimeline(timeline);
  renderTable(results);
  updateMetrics(results);
}


// Priority Non-Preemptive
function runPriorityNP() {
  resetUI();
  const queue = [...processes];
  let time = 0;
  const results = [];

  while (queue.length) {
    const available = queue.filter(p => p.arrival <= time);
    const next = available.length
      ? available.reduce((a, b) => (a.priority < b.priority ? a : b))
      : queue.reduce((a, b) => (a.arrival < b.arrival ? a : b));

    const start = Math.max(time, next.arrival);
    const completion = start + next.burst;
    const turnaround = completion - next.arrival;
    const waiting = turnaround - next.burst;
    const response = waiting;

    results.push({ ...next, start, completion, turnaround, waiting, response });
    time = completion;
        queue.splice(queue.indexOf(next), 1);
  }

  renderChart(results);
  renderTable(results);
  updateMetrics(results);
}

// Priority Preemptive
function runPriorityP() {
  resetUI();
  const queue = processes.map(p => ({ ...p, remaining: p.burst }));
  let time = 0;
  const results = [];
  const timeline = [];

  while (queue.some(p => p.remaining > 0)) {
    const available = queue.filter(p => p.arrival <= time && p.remaining > 0);
    const current = available.length
      ? available.reduce((a, b) => (a.priority < b.priority ? a : b))
      : null;

    if (current) {
      if (!current.started) {
        current.start = time;
        current.started = true;
      }
      current.remaining--;
      timeline.push(current.pname);
      if (current.remaining === 0) {
        current.completion = time + 1;
        current.turnaround = current.completion - current.arrival;
        current.waiting = current.turnaround - current.burst;
        current.response = current.start - current.arrival;
        results.push(current);
      }
    } else {
      timeline.push("Idle");
    }
    time++;
  }

  renderChartFromTimeline(timeline);
  renderTable(results);
  updateMetrics(results);
}

