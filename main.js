// ===== 1. �B�~���L�ɬq (extraBusy) =====
// 0 = �P���@, 1 = �P���G �K 4 = �P�����]�P slot ��Ƥ@�P�^
const extraBusy = {
    "Leo": [
      { weekday: 0, start: "18:00", end: "20:30" }, // �g�@
      { weekday: 1, start: "18:00", end: "20:30" }, // �g�G
      { weekday: 4, start: "19:00", end: "21:30" }  // �g��
    ],
    "���Q��a��s�Ϸs������aka�Q��W�εت��H�@":[
      { weekday: 0, start: "20:30", end: "23:59" },
      { weekday: 1, start: "20:30", end: "23:59" },
      { weekday: 2, start: "20:30", end: "23:59" },
      { weekday: 3, start: "20:30", end: "23:59" },
      { weekday: 4, start: "20:30", end: "23:59" },
      { weekday: 5, start: "20:30", end: "23:59" },
      { weekday: 6, start: "20:30", end: "23:59" }
    ],
    "�`�@���Ӧr":[
      { weekday: 5, start: "00:00", end: "23:59" },
      { weekday: 6, start: "00:00", end: "23:59" }
    ]
  };
  
  /*****************************
   * 2. �`���ɶ���� (slotMeta)
   *****************************/
  const slotMeta = [
    { letter: "A", start: "08:10", end: "09:00" },
    { letter: "B", start: "09:10", end: "10:00" },
    { letter: "C", start: "10:10", end: "11:00" },
    { letter: "D", start: "11:10", end: "12:00" },
    // �s�W����
    { letter: "N", start: "12:10", end: "13:00" },
    { letter: "E", start: "13:10", end: "14:00" },
    { letter: "F", start: "14:10", end: "15:00" },
    { letter: "G", start: "15:10", end: "16:00" },
    { letter: "H", start: "16:10", end: "17:00" },
    { letter: "Z", start: "17:10", end: "18:00" },
    // �s�W 18:00 ����
    { letter: "X", start: "18:00", end: "23:59" }
  ];
  
  
  /*****************************
   * 3. ���Τu��禡            *
   *****************************/
  // 3?1 ���o�{�b�ݩ���@�` (�^�� slotMeta ������)
  function getCurrentSlotIndex(date = new Date()) {
    const hhmm = date.toTimeString().slice(0, 5); // "HH:MM"
    return slotMeta.findIndex(({ start, end }) => start <= hhmm && hhmm < end);
  }
  
  // 3?2 �P�_�O�_�b�B�~���L�ɬq
  function isExtraBusy(name, weekdayIdx, hhmm) {
    const list = extraBusy[name];
    if (!list) return false;
    return list.some(({ weekday, start, end }) => weekday === weekdayIdx && start <= hhmm && hhmm < end);
  }
  
  // 3?3 ��X���`���Ū��H�}�C (�Ǧ^�m�W)
  function findFreeStudents(schedules, weekdayIdx, slotIdx, hhmmNow) {
    return Object.entries(schedules)
      .filter(([name, { data }]) => {
        const hasScheduleData = Array.isArray(data) && data[slotIdx];
        if (!hasScheduleData) return false;
        const noClass   = data[slotIdx][weekdayIdx] === "0";
        const notBusy   = !isExtraBusy(name, weekdayIdx, hhmmNow);
        return noClass && notBusy;
      })
      .map(([name]) => name);
  }
  
  /*****************************
   * 4. �J�f�G�����J schedules.json�A�A�Ұ� App
   *****************************/
  let schedules = {};
  fetch("schedules.json")
    .then(res => res.json())
    .then(json => {
      schedules = json;
      initApp();
    })
    .catch(err => {
      console.error("���J schedules.json ����", err);
      initApp(); // �Y�ϥ��ѡA�]��l�ơA�H�K�L����
    });
  
  /*****************************
   * 5. ��l�� UI �P�ƥ�          *
   *****************************/
  function initApp() {
    const scheduleSelect = document.getElementById("scheduleSelect");
    const timeSlotSelect = document.getElementById("timeSlotSelect");
    const weekdaySelect  = document.getElementById("weekdaySelect");
    const resultDiv      = document.getElementById("result");
  
    // 5?1 �ʺA���͡u�m�W�v�U�Կ��
    Object.keys(schedules).forEach(name => {
      const opt       = document.createElement("option");
      opt.value       = name;
      opt.textContent = name;
      scheduleSelect.appendChild(opt);
    });
  
    // 5?2 �Ҫ�d�߫��s
    document.getElementById("searchBtn").addEventListener("click", () => {
      const name       = scheduleSelect.value;
      const slotIdx    = Number(timeSlotSelect.value);
      const weekdayIdx = Number(weekdaySelect.value);
    
      // ���X�� slot ������ɶ��϶�
      const slotStart = slotMeta[slotIdx].start;
      const slotEnd   = slotMeta[slotIdx].end;
    
      const sched = schedules[name];
      if (!sched) {
        resultDiv.textContent = "�d�L���Ҫ�";
        return;
      }
    
      // �P�_��q slot �P extraBusy ���@�϶��O�_���涰
      const busySlot = (extraBusy[name] || []).find(({ weekday, start, end }) => {
        if (weekday !== weekdayIdx) return false;
        // �S�涰����ر��p�Gextra ���� ? slot �}�l�A�� extra �}�l ? slot ����
        const noOverlap = (end <= slotStart) || (start >= slotEnd);
        return !noOverlap;
      });
    
      // �p�G�ڥ��S data
      if (!Array.isArray(sched.data) || sched.data.length === 0) {
        if (busySlot) {
          resultDiv.textContent = `����Q�I�ǡG${busySlot.start} �� ${busySlot.end}`;
        } else {
          resultDiv.textContent = "�����������S���Ҫ�A�D�`���";
        }
        return;
      }
    
      // ���ƽҪ��ܥ��ݦ��L��
      const course = sched.data[slotIdx]
                   ? sched.data[slotIdx][weekdayIdx]
                   : null;
    
      if (course && course !== "0") {
        resultDiv.textContent = `�Ӯɬq���ҡG${course}`;
      } else if (busySlot) {
        // �u�n�涰�N���L�A��ܧ��� extraBusy �d��
        resultDiv.textContent = `����Q�I�ǡG${busySlot.start} �� ${busySlot.end}`;
      } else {
        resultDiv.textContent = "�o�Ӯɶ��ګܶ��A�ګܤ��I";
      }
    });
    
  
    // 5?3 �]���O�G�C������s�@��
    updateFreeMarquee();
    setInterval(updateFreeMarquee, 60 * 1000);
  }
  
  /*****************************
   * 6. �]���O��s�޿�            *
   *****************************/
  function updateFreeMarquee() {
    const span = document.querySelector("#freeMarquee span");
    if (!span) return;
  
    if (!Object.keys(schedules).length) {
      span.textContent = "���J�Ҫ��K";
      return;
    }
  
    const now         = new Date();
    const weekdayIdx  = now.getDay() - 1; // 0 = �@ �K 4 = ��
    const slotIdx     = getCurrentSlotIndex(now);
    const hhmm        = now.toTimeString().slice(0, 5);
  
    if (weekdayIdx < 0 || weekdayIdx > 4) {
      span.textContent = "�g���r�֡�j�a���񰲡I";
      return;
    }
    if (slotIdx === -1) {
      span.textContent = "�ثe���b�ƽҸ`��";
      return;
    }
  
    const freeList = findFreeStudents(schedules, weekdayIdx, slotIdx, hhmm);
    span.textContent = freeList.length
      ? `�{�b ${slotMeta[slotIdx].letter} �`���šG${freeList.join("�B")}`
      : `�{�b ${slotMeta[slotIdx].letter} �`�j�a���S�ų�I`;
  }
  