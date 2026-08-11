
(() => {
  const data = window.MI_DATA;
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  const navButtons = $$('.nav button[data-view]');
  const panels = $$('.panel');

  function activate(view, updateHash=true){
    panels.forEach(p => p.classList.toggle('active', p.id === view));
    navButtons.forEach(b => b.classList.toggle('active', b.dataset.view === view));
    if(updateHash) history.replaceState(null, '', '#' + view);
    window.scrollTo({top: $('.site-main').offsetTop - 70, behavior:'smooth'});
  }

  navButtons.forEach(b => b.addEventListener('click', () => activate(b.dataset.view)));
  const initial = location.hash.replace('#','');
  if(initial && $('#' + CSS.escape(initial))) activate(initial, false);

  const program = data.program;
  $('#programDates').textContent = `${program.start} — ${program.end}`;
  $('#programPhase').textContent = program.phase;
  $('#owner').textContent = program.owner;

  const current = data.notes.find(n => n.id === program.current_note);
  if(current){
    $('#currentIndex').textContent = `NOTE ${current.index}`;
    $('#currentPhase').textContent = current.phase;
    $('#currentTitle').textContent = current.title;
    $('#currentDescription').textContent = current.description;
    $('#currentTimeframe').textContent = current.timeframe;
    $('#currentInstruments').textContent = current.instruments.join(' × ');
    $('#currentDate').textContent = current.date;
    $('#currentLink').href = current.url;
  }

  // Tiny scenario previews: deliberately abstract; detailed candles live in Note 00.
  const previewPaths = [
    "M4 46 L26 40 L48 44 L70 37 L92 41 L114 36 L136 39 L160 34",
    "M4 50 L26 42 L48 33 L70 23 L92 18 L114 30 L136 39 L160 44",
    "M4 24 L26 28 L48 35 L70 43 L92 49 L114 55 L136 59 L160 64",
    "M4 56 L26 60 L48 50 L70 40 L92 28 L114 35 L136 22 L160 12"
  ];
  $$('.spark').forEach((el,i) => {
    el.innerHTML = `<svg viewBox="0 0 164 72" aria-hidden="true">
      <line class="level" x1="2" y1="${i===2?42:30}" x2="162" y2="${i===2?42:30}" />
      <path d="${previewPaths[i]}" />
      <circle class="event" cx="${i===1?112:i===3?116:136}" cy="${i===1?30:i===3?35:i===2?59:39}" r="3.5"/>
    </svg>`;
  });

  // Roadmap
  const timeline = $('#timeline');
  data.roadmap.forEach(m => {
    const notes = data.notes.filter(n => n.month === m.num);
    const noteHtml = notes.length ? `
      <div class="month-note">
        ${notes.map(n => `<a href="${n.url}">NOTE ${n.index} · ${n.title} →</a><small>${n.date} · ${n.status}</small>`).join('')}
      </div>` : `<div class="month-note"><small>수업 기록이 생기면 이 달에 자동으로 연결됩니다.</small></div>`;
    const el = document.createElement('div');
    el.className = 'month' + (m.num === program.current_month ? ' current open' : '');
    el.innerHTML = `
      <div class="month-num">${m.num}</div>
      <article class="month-card">
        <div class="month-head" role="button" aria-expanded="${m.num===program.current_month?'true':'false'}">
          <div>
            <div class="month-phase">${m.phase} · ${m.phase_en}</div>
            <h3>${m.title}</h3>
            <p class="month-question">${m.question}</p>
          </div>
          <div class="month-date">${m.date}</div>
        </div>
        <div class="month-details">
          <div class="detail-grid">
            <div><b>이번 달에 볼 것</b><p>${m.core}</p></div>
            <div><b>이번 달에 남길 것</b><p>${m.output}</p></div>
          </div>
          ${noteHtml}
          ${m.expansion ? `<div class="expansion">↘ EXPANSION · ${m.expansion}</div>` : ''}
        </div>
      </article>`;
    $('.month-head', el).addEventListener('click', () => {
      const open = el.classList.toggle('open');
      $('.month-head', el).setAttribute('aria-expanded', String(open));
    });
    timeline.appendChild(el);
  });

  // Notes
  const notesList = $('#notesList');
  data.notes.forEach(n => {
    const row = document.createElement('article');
    row.className = 'note-row';
    row.innerHTML = `
      <div class="note-index">${n.index}</div>
      <div>
        <a href="${n.url}"><h3>${n.title}</h3></a>
        <p>${n.description}</p>
      </div>
      <div class="note-side">
        <span class="status">${n.status}</span><br>
        ${n.date}<br>${n.phase}<br>${n.timeframe}
      </div>`;
    notesList.appendChild(row);
  });
  const empty = document.createElement('div');
  empty.className = 'empty-note';
  empty.textContent = 'NOTE 01부터 이곳에 시간순으로 계속 쌓입니다. 틀린 가설도 지우지 않고 REVIEWED · REVISED · SUPERSEDED 상태로 남깁니다.';
  notesList.appendChild(empty);

  // Language
  const conceptGrid = $('#conceptGrid');
  function renderConcepts(filter='ALL'){
    conceptGrid.innerHTML = '';
    data.concepts.filter(c => filter==='ALL' || c.state===filter).forEach(c => {
      const el = document.createElement('article');
      el.className = 'concept';
      el.innerHTML = `
        <div class="concept-meta"><span class="concept-state">${c.state}</span><span>${c.first}</span></div>
        <h3>${c.name}</h3>
        <div style="font-size:10px;color:var(--muted);margin-bottom:10px">${c.en}</div>
        <p>${c.description}</p>`;
      conceptGrid.appendChild(el);
    });
  }
  renderConcepts();
  $$('.concept-filter button').forEach(b => b.addEventListener('click', () => {
    $$('.concept-filter button').forEach(x => x.classList.toggle('active', x===b));
    renderConcepts(b.dataset.filter);
  }));

  // Field loop
  const loop = $('#fieldLoop');
  data.field_loop.forEach(step => {
    const el = document.createElement('div');
    el.className = 'field-step';
    el.innerHTML = `<small>${step[0]}</small><b>${step[1]}</b><p>${step[2]}</p>`;
    loop.appendChild(el);
  });

})();
