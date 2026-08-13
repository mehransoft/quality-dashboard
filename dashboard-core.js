function initDashboard(RAWData){
const RAW = RAWData;
const PERSIAN_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
const SEASON_NAMES = ['بهار','تابستان','پاییز','زمستان'];

function jalaliToGregorian(jy, jm, jd) {
  jy=parseInt(jy); jm=parseInt(jm); jd=parseInt(jd);
  let gy=(jy<=979)?621:1600; jy-=(jy<=979)?0:979;
  let days=(365*jy)+(Math.floor(jy/33)*8)+Math.floor(((jy%33)+3)/4)+78+jd+((jm<7)?(jm-1)*31:((jm-7)*30)+186);
  gy+=400*Math.floor(days/146097); days%=146097;
  if(days>36524){gy+=100*Math.floor(--days/36524); days%=36524; if(days>=365)days++;}
  gy+=4*Math.floor(days/1461); days%=1461;
  if(days>365){gy+=Math.floor((days-1)/365); days=(days-1)%365;}
  let gd=days+1;
  const monthDays=[0,31,(((gy%4===0)&&(gy%100!==0))||(gy%400===0))?29:28,31,30,31,30,31,31,30,31,30,31];
  let gm=0; for(gm=1; gm<=12; gm++){ if(gd<=monthDays[gm])break; gd-=monthDays[gm]; }
  return [gy,gm,gd];
}
function gregorianToJalali(gy, gm, gd) {
  gy=parseInt(gy); gm=parseInt(gm); gd=parseInt(gd);
  const g_d_m=[0,31,59,90,120,151,181,212,243,273,304,334];
  let jy=(gy<=1600)?0:979; gy-=(gy<=1600)?621:1600;
  let gy2=(gm>2)?(gy+1):gy;
  let days=(365*gy)+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)-80+gd+g_d_m[gm-1];
  jy+=33*Math.floor(days/12053); days%=12053;
  jy+=4*Math.floor(days/1461); days%=1461;
  jy+=Math.floor((days-1)/365); if(days>365) days=(days-1)%365;
  let jm=(days<186)?1+Math.floor(days/31):7+Math.floor((days-186)/30);
  let jd=1+((days<186)?(days%31):((days-186)%30));
  return [jy,jm,jd];
}
function parseJalaliStr(s){ if(!s) return null; const p=s.split('/').map(x=>parseInt(x,10)); if(p.length!==3||p.some(isNaN)) return null; return p; }
function jalaliStrToISO(s){ const p=parseJalaliStr(s); if(!p) return null; const g=jalaliToGregorian(p[0],p[1],p[2]); return g[0]+'-'+String(g[1]).padStart(2,'0')+'-'+String(g[2]).padStart(2,'0'); }
function isoToJalaliStr(iso){ const parts=iso.split('-').map(Number); const j=gregorianToJalali(parts[0],parts[1],parts[2]); return j[0]+'/'+String(j[1]).padStart(2,'0')+'/'+String(j[2]).padStart(2,'0'); }
function isoToJalaliFull(iso){ const parts=iso.split('-').map(Number); const j=gregorianToJalali(parts[0],parts[1],parts[2]); return j[2]+' '+PERSIAN_MONTHS[j[1]-1]+' '+j[0]; }

RAW.nonconforming.forEach(function(r){ r.iso = jalaliStrToISO(r.date); const p=parseJalaliStr(r.date); if(p){r.jy=p[0]; r.jm=p[1];} });
RAW.ramto.forEach(function(r){ r.iso = jalaliStrToISO(r.date); const p=parseJalaliStr(r.date); if(p){r.jy=p[0]; r.jm=p[1];} });
RAW.production.forEach(function(r){ r.iso = jalaliStrToISO(r.date); const p=parseJalaliStr(r.date); if(p){r.jy=p[0]; r.jm=p[1];} });

const allISO = RAW.nonconforming.map(function(r){return r.iso;}).concat(RAW.ramto.map(function(r){return r.iso;})).concat(RAW.production.map(function(r){return r.iso;})).filter(Boolean).sort();
const minISO = allISO[0], maxISO = allISO[allISO.length-1];

document.getElementById('genTime').textContent = 'آخرین به‌روزرسانی: ' + RAW.generatedAt;

/* ---------- Jalali dropdown date picker ---------- */
function isJalaliLeap(jy){ const r=((jy%33)+33)%33; return [1,5,9,13,17,22,26,30].indexOf(r)!==-1; }
function jalaliMonthLength(jy,jm){ if(jm<=6) return 31; if(jm<=11) return 30; return isJalaliLeap(jy)?30:29; }

const minJalali = parseJalaliStr(isoToJalaliStr(minISO));
const maxJalali = parseJalaliStr(isoToJalaliStr(maxISO));

const defaultFromDate = new Date(maxISO); defaultFromDate.setDate(defaultFromDate.getDate()-7);
let defaultFromISO = defaultFromDate.toISOString().slice(0,10);
if (defaultFromISO < minISO) defaultFromISO = minISO;
const defaultFromJalali = parseJalaliStr(isoToJalaliStr(defaultFromISO));

function fillSelect(el, from, to, formatter){
  el.innerHTML='';
  for(let i=from;i<=to;i++){
    const opt=document.createElement('option');
    opt.value=i; opt.textContent = formatter? formatter(i) : i;
    el.appendChild(opt);
  }
}
function setupDatePicker(prefix, initJalali){
  const daySel=document.getElementById(prefix+'Day'), monthSel=document.getElementById(prefix+'Month'), yearSel=document.getElementById(prefix+'Year');
  fillSelect(monthSel, 1, 12, function(i){ return PERSIAN_MONTHS[i-1]; });
  fillSelect(yearSel, minJalali[0], maxJalali[0]);
  yearSel.value = initJalali[0]; monthSel.value = initJalali[1];
  fillSelect(daySel, 1, jalaliMonthLength(initJalali[0], initJalali[1]));
  daySel.value = initJalali[2];
}
setupDatePicker('from', defaultFromJalali);
setupDatePicker('to', maxJalali);

function readDatePicker(prefix){
  const y=parseInt(document.getElementById(prefix+'Year').value);
  const m=parseInt(document.getElementById(prefix+'Month').value);
  const maxD=jalaliMonthLength(y,m);
  const daySel=document.getElementById(prefix+'Day');
  if (parseInt(daySel.options[daySel.options.length-1].value) !== maxD) fillSelect(daySel, 1, maxD);
  let d=parseInt(daySel.value); if(d>maxD){ d=maxD; daySel.value=d; }
  return jalaliStrToISO(y+'/'+String(m).padStart(2,'0')+'/'+String(d).padStart(2,'0'));
}
function syncDatePicker(prefix, iso){
  const p=parseJalaliStr(isoToJalaliStr(iso));
  document.getElementById(prefix+'Year').value=p[0];
  document.getElementById(prefix+'Month').value=p[1];
  fillSelect(document.getElementById(prefix+'Day'), 1, jalaliMonthLength(p[0],p[1]));
  document.getElementById(prefix+'Day').value=p[2];
}
function onDatePickerChange(prefix){
  let iso = readDatePicker(prefix);
  if (iso < minISO) iso = minISO; if (iso > maxISO) iso = maxISO;
  if (prefix==='from') state.from = iso; else state.to = iso;
  if (state.from > state.to) { if (prefix==='from') { state.to = state.from; syncDatePicker('to', state.to); } else { state.from = state.to; syncDatePicker('from', state.from); } }
  state.page=1; setActivePreset(null); render();
}
['fromDay','fromMonth','fromYear'].forEach(function(id){ document.getElementById(id).addEventListener('change', function(){ onDatePickerChange('from'); }); });
['toDay','toMonth','toYear'].forEach(function(id){ document.getElementById(id).addEventListener('change', function(){ onDatePickerChange('to'); }); });

/* طبق تعریف پروژه، «ضایعات» شامل همه دسته‌های تصمیم‌گیری ثبت‌شده در فایل اقلام نامنطبق است (بدون فیلتر انتخابی) */
let state = { from:defaultFromISO, to:maxISO, gran:'daily', tableType:'all', search:'', sortKey:'date', sortDir:'desc', page:1, pageSize:50 };
function inRange(iso){ return iso && iso>=state.from && iso<=state.to; }

const HAS_CHART = (typeof Chart !== 'undefined');
if (!HAS_CHART) { document.getElementById('libWarning').style.display = 'block'; }
else { Chart.defaults.color='#8b95a1'; Chart.defaults.font={family:'Tahoma, Segoe UI, Arial, sans-serif', size:11}; Chart.defaults.borderColor='#2a313b'; }

let charts = {};
function destroyChart(key){ if(charts[key]){ charts[key].destroy(); delete charts[key]; } }
function fmt(n, digits){ if(digits===undefined) digits=1; if(n===undefined||n===null||isNaN(n)) return '۰'; return Number(n).toLocaleString('en-US',{maximumFractionDigits:digits, minimumFractionDigits:0}); }
function pct(a,b){ return b>0 ? (a/b*100) : 0; }

function sparklineSVG(values, color){
  if (!values || values.length < 2) return '';
  const w=110, h=28, pad=2;
  const min=Math.min.apply(null,values), max=Math.max.apply(null,values);
  const range = (max-min) || 1;
  const step = (w-2*pad)/(values.length-1);
  const pts = values.map(function(v,i){
    const x = pad + i*step;
    const y = h - pad - ((v-min)/range)*(h-2*pad);
    return x.toFixed(1)+','+y.toFixed(1);
  }).join(' ');
  const lastX = pad + (values.length-1)*step;
  const lastY = h - pad - ((values[values.length-1]-min)/range)*(h-2*pad);
  return '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><polyline points="'+pts+'" fill="none" stroke="'+color+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/><circle cx="'+lastX+'" cy="'+lastY+'" r="2.3" fill="'+color+'"/></svg>';
}

function bucketDaily(r){ return {key:r.iso, label:r.date}; }
function isoWeekKey(iso){ const d=new Date(iso); const onejan=new Date(d.getFullYear(),0,1); const week=Math.ceil((((d-onejan)/86400000)+onejan.getDay()+1)/7); return d.getFullYear()+'-W'+String(week).padStart(2,'0'); }
function bucketWeekly(r){ const k=isoWeekKey(r.iso); return {key:k, label:k}; }
function bucketMonthly(r){ const key=r.jy*100+r.jm; const label=PERSIAN_MONTHS[r.jm-1]+' '+r.jy; return {key:key,label:label}; }
function bucketQuarterly(r){ const q=Math.ceil(r.jm/3); const key=r.jy*10+q; const label=SEASON_NAMES[q-1]+' '+r.jy; return {key:key,label:label}; }
function bucketHalf(r){ const h=r.jm<=6?1:2; const key=r.jy*10+h; const label=(h===1?'نیمه اول ':'نیمه دوم ')+r.jy; return {key:key,label:label}; }
function bucketYearly(r){ return {key:r.jy, label:'سال '+r.jy}; }
const GRAN_FUNCS = {daily:bucketDaily, weekly:bucketWeekly, monthly:bucketMonthly, quarterly:bucketQuarterly, half:bucketHalf, yearly:bucketYearly};
const GRAN_LABELS = {daily:'روزانه', weekly:'هفتگی', monthly:'ماهانه', quarterly:'فصلی', half:'شش‌ماهه', yearly:'سالانه'};

function computeBuckets(gran, wasteRows, ramtoRows, prodRows){
  const fn = GRAN_FUNCS[gran];
  const map = new Map();
  function ensure(key,label){ if(!map.has(key)) map.set(key,{label:label,prodCount:0,prodWeight:0,ramtoCount:0,ramtoWeight:0,wasteWeight:0,wasteCount:0}); return map.get(key); }
  prodRows.forEach(function(r){ if(!r.jy) return; const b0=fn(r); const b=ensure(b0.key,b0.label); b.prodCount+=r.count; b.prodWeight+=r.totalWeight; });
  ramtoRows.forEach(function(r){ if(!r.jy) return; const b0=fn(r); const b=ensure(b0.key,b0.label); b.ramtoCount+=r.count; b.ramtoWeight+=r.totalWeight; });
  wasteRows.forEach(function(r){ if(!r.jy) return; const b0=fn(r); const b=ensure(b0.key,b0.label); b.wasteWeight+=r.totalWeight; b.wasteCount+=r.count; });
  const keys=Array.from(map.keys()).sort(function(a,b){ return a>b?1:(a<b?-1:0); });
  const arr=keys.map(function(k){return map.get(k);});
  arr.forEach(function(b){ b.ramtoPct = pct(b.ramtoCount, b.prodCount); b.wastePct = pct(b.wasteWeight, b.prodWeight); });
  return arr;
}

function trendDirection(values){
  const v = values.filter(function(x){return x!==undefined && x!==null && !isNaN(x);});
  if (v.length < 2) return {dir:'ثابت'};
  const half = Math.max(1, Math.floor(v.length/2));
  const first = v.slice(0, half), second = v.slice(v.length-half);
  function avg(arr){ return arr.reduce(function(a,b){return a+b;},0)/arr.length; }
  const a1=avg(first), a2=avg(second);
  const diff = a1!==0 ? ((a2-a1)/Math.abs(a1)*100) : (a2>0?100:0);
  let dir = 'نسبتاً ثابت';
  if (diff > 8) dir='افزایشی';
  else if (diff < -8) dir='کاهشی';
  return {dir:dir, diff:diff};
}

function render(){
  const ncInRange = RAW.nonconforming.filter(function(r){return inRange(r.iso);});
  const ramtoInRange = RAW.ramto.filter(function(r){return inRange(r.iso);});
  const prodInRange = RAW.production.filter(function(r){return inRange(r.iso);});
  const wasteRows = ncInRange.filter(function(r){ return r.decision && r.decision.indexOf('ضایعات') >= 0; }); /* فقط رکوردهایی که در تصمیم‌گیری کلمه «ضایعات» دارند */

  const m = computeKPIMetrics(wasteRows, ncInRange, ramtoInRange, prodInRange);
  renderTrendHeaderValues(m);
  renderFlowSummary(m);

  const buckets = computeBuckets(state.gran, wasteRows, ramtoInRange, prodInRange);
  if (HAS_CHART) renderTrendCharts(buckets);
  renderTrendInsight(buckets);
  if (HAS_CHART) renderControlCharts(buckets);
  renderControlChartInsight(buckets);

  renderCauseTable('ramtoCauseTable', buildCauseAgg(ramtoInRange, 'cause', 'count'), 'تعداد');
  renderCauseTable('wasteCauseTable', buildCauseAgg(wasteRows, 'rootCause', 'totalWeight'), 'وزن (kg)');
  renderCauseInsights(ramtoInRange, wasteRows);

  if (HAS_CHART) { renderParetoNC(wasteRows); renderParetoRamto(ramtoInRange); renderByProduct(wasteRows, ramtoInRange); }
  renderProductInsight(wasteRows, ramtoInRange);

  renderTable(ncInRange, ramtoInRange);
}

function renderTrendHeaderValues(m){
  document.getElementById('valProdCount').innerHTML = fmt(m.totalProdCount,0)+'<span class="unit">عدد</span>';
  document.getElementById('valProdWeight').innerHTML = fmt(m.totalProdWeight,0)+'<span class="unit">kg</span>';
  document.getElementById('valRamtoCount').innerHTML = fmt(m.totalRamtoCount,0)+'<span class="unit">عدد</span>';
  document.getElementById('valRamtoPct').innerHTML = fmt(m.ramtoPct,2)+'<span class="unit">٪</span>';
  document.getElementById('valWasteWeight').innerHTML = fmt(m.wasteWeight,1)+'<span class="unit">kg</span>';
  document.getElementById('valWastePct').innerHTML = fmt(m.wastePct,2)+'<span class="unit">٪</span>';
}

function computeKPIMetrics(wasteRows, ncInRange, ramtoInRange, prodInRange){
  const wasteWeight = wasteRows.reduce(function(s,r){return s+r.totalWeight;},0);
  const wasteCount = wasteRows.reduce(function(s,r){return s+r.count;},0);
  const totalNCCount = ncInRange.reduce(function(s,r){return s+r.count;},0);
  const totalRamtoCount = ramtoInRange.reduce(function(s,r){return s+r.count;},0);
  const ramtoWeight = ramtoInRange.reduce(function(s,r){return s+r.totalWeight;},0);
  const totalProdCount = prodInRange.reduce(function(s,r){return s+r.count;},0);
  const totalProdWeight = prodInRange.reduce(function(s,r){return s+r.totalWeight;},0);
  const ramtoPct = pct(totalRamtoCount, totalProdCount);
  const wastePct = pct(wasteWeight, totalProdWeight);
  return {wasteWeight:wasteWeight, wasteCount:wasteCount, totalNCCount:totalNCCount, totalRamtoCount:totalRamtoCount, ramtoWeight:ramtoWeight, totalProdCount:totalProdCount, totalProdWeight:totalProdWeight, ramtoPct:ramtoPct, wastePct:wastePct};
}

const ARROW_SVG = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 5l-7 7 7 7" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/></svg>';

function flowRow(rightLabel, rightValue, leftLabel, leftValue, colorClass, outlineClass){
  /* راست‌چین: اول DOM = سمت راست صفحه (چون dir=rtl) -> جعبه رنگی (تعداد) راست، جعبه outline (وزن/درصد) چپ، فلش رو به چپ */
  return '<div class="flow-row">'
    + '<div class="flow-box '+colorClass+'"><span class="fb-label">'+rightLabel+'</span><span class="fb-value">'+rightValue+'</span></div>'
    + '<div class="flow-arrow">'+ARROW_SVG+'</div>'
    + '<div class="flow-box outline '+outlineClass+'"><span class="fb-label">'+leftLabel+'</span><span class="fb-value">'+leftValue+'</span></div>'
    + '</div>';
}

function renderFlowSummary(m){
  const html =
    flowRow('جمع کل تولید:', fmt(m.totalProdCount,0)+' عدد', 'وزن کل تولید:', fmt(m.totalProdWeight,2)+' کیلوگرم', 'solid-green', 'o-green')
    + flowRow('جمع کل رامتو (دلایل کیفی):', fmt(m.totalRamtoCount,0)+' عدد', 'درصد رامتو به کل تولید:', fmt(m.ramtoPct,2)+'٪', 'solid-teal', 'o-teal')
    + flowRow('وزن کل ضایعات:', fmt(m.wasteWeight,2)+' کیلوگرم', 'درصد کل ضایعات:', fmt(m.wastePct,2)+'٪', 'solid-red', 'o-red');
  document.getElementById('flowSummary').innerHTML = html;
}

function renderTrendCharts(buckets){
  const labels = buckets.map(function(b){return b.label;});
  const specs = [
    {id:'trendProdCount', key:'prodCount', color:'#2dd4bf', type:'bar'},
    {id:'trendProdWeight', key:'prodWeight', color:'#2dd4bf', type:'line'},
    {id:'trendRamtoCount', key:'ramtoCount', color:'#f2b705', type:'bar'},
    {id:'trendRamtoPct', key:'ramtoPct', color:'#5fbf6f', type:'line'},
    {id:'trendWasteWeight', key:'wasteWeight', color:'#ef5350', type:'bar'},
    {id:'trendWastePct', key:'wastePct', color:'#ef5350', type:'line'},
  ];
  specs.forEach(function(s){
    destroyChart(s.id);
    const data = buckets.map(function(b){return Number((b[s.key]||0).toFixed(2));});
    charts[s.id] = new Chart(document.getElementById(s.id), {
      type: s.type,
      data:{ labels:labels, datasets:[{ data:data, borderColor:s.color, backgroundColor: s.type==='bar'? s.color+'99' : s.color+'22', fill: s.type==='line', tension:.3, borderRadius:3, pointRadius:2 }] },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{
          y:{grid:{color:'#2a313b'}, ticks:{maxTicksLimit:5}},
          x:{grid:{display:false}, ticks:{maxRotation:55, minRotation:35, autoSkip:true, maxTicksLimit:10}}
        }
      }
    });
  });
}

function renderTrendInsight(buckets){
  if (buckets.length < 2) {
    document.getElementById('trendInsight').innerHTML = '<div class="ins-title">تحلیل روند</div>داده کافی در این بازه برای تحلیل روند '+GRAN_LABELS[state.gran]+' وجود ندارد.';
    return;
  }
  const wt = trendDirection(buckets.map(function(b){return b.wastePct;}));
  const rt = trendDirection(buckets.map(function(b){return b.ramtoPct;}));
  const pt = trendDirection(buckets.map(function(b){return b.prodCount;}));
  const txt = 'در نمای <b>'+GRAN_LABELS[state.gran]+'</b> و بر اساس '+buckets.length+' دوره، روند <b>درصد ضایعات</b> نسبت به نیمه اول بازه <b>'+wt.dir+'</b> بوده ('+(wt.diff!==undefined? (wt.diff>=0?'+':'')+fmt(wt.diff,1)+'٪' : '—')+')، روند <b>درصد رامتو</b> <b>'+rt.dir+'</b> بوده ('+(rt.diff!==undefined? (rt.diff>=0?'+':'')+fmt(rt.diff,1)+'٪' : '—')+') و روند <b>تعداد تولید</b> <b>'+pt.dir+'</b> بوده است ('+(pt.diff!==undefined? (pt.diff>=0?'+':'')+fmt(pt.diff,1)+'٪' : '—')+').';
  document.getElementById('trendInsight').innerHTML = '<div class="ins-title">تحلیل روند</div>'+txt;
}

/* ---------- Control Charts (SPC) ---------- */
const CONTROL_LIMITS = {
  ramto: { ucl:4, cl:2, lcl:0, label:'درصد رامتو' },
  waste: { ucl:2, cl:1, lcl:0, label:'درصد ضایعات' }
};

function controlChartConfig(labels, data, ucl, cl, lcl, color){
  const pointColors = data.map(function(v){ return (v>ucl||v<lcl) ? '#ef5350' : color; });
  return {
    type:'line',
    data:{ labels:labels, datasets:[
      {label:'مقدار واقعی', data:data, borderColor:color, backgroundColor:color+'1a', tension:.25, pointRadius:4, pointBackgroundColor:pointColors, pointBorderColor:pointColors, fill:false, order:1},
      {label:'حد بالا (UCL)', data:labels.map(function(){return ucl;}), borderColor:'#ef5350', borderDash:[6,4], pointRadius:0, borderWidth:1.5, fill:false, order:2},
      {label:'حد نرمال (CL)', data:labels.map(function(){return cl;}), borderColor:'#5fbf6f', borderDash:[2,3], pointRadius:0, borderWidth:1.5, fill:false, order:3},
      {label:'حد پایین (LCL)', data:labels.map(function(){return lcl;}), borderColor:'#5b9bd5', borderDash:[6,4], pointRadius:0, borderWidth:1.5, fill:false, order:4},
    ]},
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{legend:{position:'top', labels:{boxWidth:10, font:{size:10}}}},
      scales:{
        y:{grid:{color:'#2a313b'}, ticks:{callback:function(v){return v+'٪';}}, suggestedMax: Math.max(ucl*1.3, Math.max.apply(null, data.concat([0]))*1.15 || ucl*1.3)},
        x:{grid:{display:false}, ticks:{maxRotation:55, minRotation:35, autoSkip:true, maxTicksLimit:10}}
      }
    }
  };
}

function renderControlCharts(buckets){
  const labels = buckets.map(function(b){return b.label;});
  destroyChart('controlRamto'); destroyChart('controlWaste');
  const ramtoData = buckets.map(function(b){return Number((b.ramtoPct||0).toFixed(2));});
  const wasteData = buckets.map(function(b){return Number((b.wastePct||0).toFixed(2));});
  charts.controlRamto = new Chart(document.getElementById('controlRamto'), controlChartConfig(labels, ramtoData, CONTROL_LIMITS.ramto.ucl, CONTROL_LIMITS.ramto.cl, CONTROL_LIMITS.ramto.lcl, '#f2b705'));
  charts.controlWaste = new Chart(document.getElementById('controlWaste'), controlChartConfig(labels, wasteData, CONTROL_LIMITS.waste.ucl, CONTROL_LIMITS.waste.cl, CONTROL_LIMITS.waste.lcl, '#ef5350'));
}

/* قواعد ساده‌شده نمودار کنترل (مشابه قواعد نلسون): نقاط خارج از حد، توالی ۷+ نقطه یک‌طرف خط مرکزی، روند پیوسته ۶+ نقطه */
function analyzeControlChart(buckets, key, ucl, cl, lcl){
  const values = buckets.map(function(b){return Number((b[key]||0).toFixed(2));});
  const labels = buckets.map(function(b){return b.label;});
  const outPoints = [];
  values.forEach(function(v,i){ if(v>ucl || v<lcl) outPoints.push({i:i, label:labels[i], v:v}); });

  const runs = [];
  let curSide=null, curStart=0;
  for(let i=0;i<values.length;i++){
    const side = values[i]>cl ? 'above' : (values[i]<cl ? 'below':'on');
    if(side===curSide){ /* ادامه توالی */ }
    else { if(curSide && curSide!=='on' && (i-curStart)>=7) runs.push({side:curSide, start:curStart, end:i-1, len:i-curStart}); curSide=side; curStart=i; }
  }
  if(curSide && curSide!=='on' && (values.length-curStart)>=7) runs.push({side:curSide, start:curStart, end:values.length-1, len:values.length-curStart});

  const trends = [];
  let dir=null, tStart=0;
  for(let i=1;i<values.length;i++){
    const d = values[i]>values[i-1] ? 'up' : (values[i]<values[i-1] ? 'down' : 'flat');
    if(d===dir){ }
    else { if(dir && dir!=='flat' && (i-tStart)>=6) trends.push({dir:dir, start:tStart, end:i-1, len:i-tStart+1}); dir=d; tStart=i-1; }
  }
  if(dir && dir!=='flat' && (values.length-tStart)>=6) trends.push({dir:dir, start:tStart, end:values.length-1, len:values.length-tStart+1});

  return {outPoints:outPoints, runs:runs, trends:trends, labels:labels};
}

function renderControlChartInsight(buckets){
  if (buckets.length < 3) {
    document.getElementById('controlChartInsight').innerHTML = '<div class="ins-title">تحلیل نمودار کنترل</div>برای تحلیل الگوهای نمودار کنترل، حداقل به ۳ دوره در نمای '+GRAN_LABELS[state.gran]+' نیاز است؛ بازه یا نمای زمانی را تغییر بده.';
    return;
  }
  const ra = analyzeControlChart(buckets, 'ramtoPct', CONTROL_LIMITS.ramto.ucl, CONTROL_LIMITS.ramto.cl, CONTROL_LIMITS.ramto.lcl);
  const wa = analyzeControlChart(buckets, 'wastePct', CONTROL_LIMITS.waste.ucl, CONTROL_LIMITS.waste.cl, CONTROL_LIMITS.waste.lcl);

  function describe(analysis, label){
    const parts = [];
    if (analysis.outPoints.length) {
      const names = analysis.outPoints.slice(0,5).map(function(p){return p.label+' ('+fmt(p.v,2)+'٪)';}).join('، ');
      parts.push('<b>'+analysis.outPoints.length+' دوره خارج از حد کنترل</b> شناسایی شد: '+names+(analysis.outPoints.length>5?' و موارد دیگر':'')+'. این نقاط نشان‌دهنده یک علت خاص (Special Cause) هستند که نیاز به بررسی فوری دارند.');
    }
    if (analysis.runs.length) {
      analysis.runs.forEach(function(r){
        parts.push('یک توالی <b>'+r.len+' دوره متوالی</b> ('+analysis.labels[r.start]+' تا '+analysis.labels[r.end]+') تماماً <b>'+(r.side==='above'?'بالاتر':'پایین‌تر')+'</b> از خط مرکزی مشاهده شد که نشانه رانش سیستماتیک فرآیند است، نه نوسان تصادفی.');
      });
    }
    if (analysis.trends.length) {
      analysis.trends.forEach(function(t){
        parts.push('یک روند پیوسته <b>'+(t.dir==='up'?'صعودی':'نزولی')+'</b> در <b>'+t.len+' دوره</b> ('+analysis.labels[t.start]+' تا '+analysis.labels[t.end]+') دیده می‌شود که '+(t.dir==='up'?'می‌تواند نشانه بدتر شدن تدریجی فرآیند باشد':'می‌تواند نشانه بهبود تدریجی فرآیند باشد')+'.');
      });
    }
    if (!parts.length) {
      return 'نمودار کنترل <b>'+label+'</b>: هیچ نقطه خارج از حد، توالی سیستماتیک یا روند معناداری مشاهده نشد؛ فرآیند در این بازه از نظر آماری <b>پایدار و تحت کنترل</b> است.';
    }
    return 'نمودار کنترل <b>'+label+'</b>: '+parts.join(' ');
  }

  const html = '<div class="ins-title">تحلیل نمودار کنترل ('+GRAN_LABELS[state.gran]+')</div>'
    + '<div style="margin-bottom:10px;">'+describe(ra, 'رامتو')+'</div>'
    + '<div>'+describe(wa, 'ضایعات')+'</div>';
  document.getElementById('controlChartInsight').innerHTML = html;
}

function buildCauseAgg(rows, causeField, valueField){
  const map = new Map();
  rows.forEach(function(r){ const c=r[causeField]||'(نامشخص)'; map.set(c, (map.get(c)||0) + r[valueField]); });
  const total = Array.from(map.values()).reduce(function(a,b){return a+b;},0);
  return Array.from(map.entries()).map(function(e){ return {name:e[0], value:e[1], pct: pct(e[1],total)}; }).sort(function(a,b){return b.value-a.value;});
}

function renderCauseTable(elId, agg, valueLabel){
  const rows = agg.map(function(a){
    return '<tr><td class="name">'+a.name+'</td><td>'+fmt(a.value, valueLabel.indexOf('وزن')>=0?2:0)+'</td><td style="min-width:110px;"><div style="display:flex; align-items:center; gap:8px;"><span style="min-width:42px;">'+fmt(a.pct,1)+'٪</span><div class="bar-cell" style="flex:1;"><div class="bar-fill" style="width:'+Math.min(100,a.pct)+'%;"></div></div></div></td></tr>';
  }).join('');
  document.getElementById(elId).innerHTML = '<thead><tr><th>علت</th><th>'+valueLabel+'</th><th>سهم</th></tr></thead><tbody>'+(rows || '<tr><td colspan="3" style="text-align:center; color:var(--muted); padding:16px;">داده‌ای نیست</td></tr>')+'</tbody>';
}

function renderCauseInsights(ramtoInRange, wasteRows){
  const ramtoAgg = buildCauseAgg(ramtoInRange, 'cause', 'count');
  const wasteAgg = buildCauseAgg(wasteRows, 'rootCause', 'totalWeight');

  if (ramtoAgg.length) {
    const top = ramtoAgg[0];
    const top3pct = ramtoAgg.slice(0,3).reduce(function(s,a){return s+a.pct;},0);
    document.getElementById('ramtoCauseInsight').innerHTML = '<div class="ins-title">تحلیل علل رامتو</div>پرتکرارترین علت رامتو «<b>'+top.name+'</b>» با <b>'+fmt(top.value,0)+'</b> مورد (<b>'+fmt(top.pct,1)+'٪</b>) از کل رامتوهاست. سه علت برتر مجموعاً <b>'+fmt(top3pct,1)+'٪</b> از کل رامتو را تشکیل می‌دهند — تمرکز اصلاحات روی همین موارد بیشترین اثر را خواهد داشت.';
  } else {
    document.getElementById('ramtoCauseInsight').innerHTML = '<div class="ins-title">تحلیل علل رامتو</div>در این بازه رکورد رامتویی ثبت نشده است.';
  }
  if (wasteAgg.length) {
    const top = wasteAgg[0];
    const top3pct = wasteAgg.slice(0,3).reduce(function(s,a){return s+a.pct;},0);
    document.getElementById('wasteCauseInsight').innerHTML = '<div class="ins-title">تحلیل علل ضایعات</div>بیشترین سهم وزن ضایعات مربوط به علت «<b>'+top.name+'</b>» با <b>'+fmt(top.value,1)+' kg</b> (<b>'+fmt(top.pct,1)+'٪</b>) است. سه علت برتر مجموعاً <b>'+fmt(top3pct,1)+'٪</b> از وزن ضایعات را شامل می‌شوند.';
  } else {
    document.getElementById('wasteCauseInsight').innerHTML = '<div class="ins-title">تحلیل علل ضایعات</div>در این بازه رکورد ضایعاتی (بر اساس دسته‌های انتخاب‌شده) ثبت نشده است.';
  }
}

function paretoChart(canvasId, dataMap, labelFmt){
  const entries = Array.from(dataMap.entries()).sort(function(a,b){return b[1]-a[1];});
  const labels = entries.map(function(e){return e[0]||'(نامشخص)';});
  const values = entries.map(function(e){return e[1];});
  const total = values.reduce(function(a,b){return a+b;},0);
  let cum=0; const cumPct = values.map(function(v){ cum+=v; return total? Number((cum/total*100).toFixed(1)):0; });
  destroyChart(canvasId);
  charts[canvasId] = new Chart(document.getElementById(canvasId), {
    data:{ labels:labels, datasets:[
      {type:'bar', label:labelFmt, data:values, backgroundColor:'#5b9bd5', yAxisID:'y', order:2, borderRadius:3},
      {type:'line', label:'درصد تجمعی', data:cumPct, borderColor:'#f2b705', backgroundColor:'#f2b705', yAxisID:'y1', order:1, tension:.2, pointRadius:3},
    ]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'top', labels:{boxWidth:12}}},
      scales:{ y:{position:'left', grid:{color:'#2a313b'}}, y1:{position:'right', min:0, max:100, grid:{display:false}, ticks:{callback:function(v){return v+'٪';}}},
        x:{grid:{display:false}, ticks:{maxRotation:60, minRotation:30, autoSkip:true, maxTicksLimit:12}} } }
  });
}
function renderParetoNC(wasteRows){ const map=new Map(); wasteRows.forEach(function(r){map.set(r.rootCause,(map.get(r.rootCause)||0)+r.totalWeight);}); paretoChart('paretoNC', map, 'وزن ضایعات (kg)'); }
function renderParetoRamto(ramtoRows){ const map=new Map(); ramtoRows.forEach(function(r){map.set(r.cause,(map.get(r.cause)||0)+r.count);}); paretoChart('paretoRamto', map, 'تعداد رامتو'); }

function topNBarChart(canvasId, dataMap, label, color){
  const entries=Array.from(dataMap.entries()).sort(function(a,b){return b[1]-a[1];}).slice(0,10);
  destroyChart(canvasId);
  charts[canvasId] = new Chart(document.getElementById(canvasId), {
    type:'bar', data:{ labels:entries.map(function(e){return e[0]||'(نامشخص)';}), datasets:[{label:label, data:entries.map(function(e){return Number(e[1].toFixed(2));}), backgroundColor:color, borderRadius:4}] },
    options:{ indexAxis:'y', responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{x:{grid:{color:'#2a313b'}}, y:{grid:{display:false}}} }
  });
}
function renderByProduct(wasteRows, ramtoRows){
  const wMap=new Map(); wasteRows.forEach(function(r){wMap.set(r.part,(wMap.get(r.part)||0)+r.totalWeight);});
  topNBarChart('byProductWaste', wMap, 'وزن ضایعات (kg)', '#ef5350');
  const rMap=new Map(); ramtoRows.forEach(function(r){rMap.set(r.product,(rMap.get(r.product)||0)+r.count);});
  topNBarChart('byProductRamto', rMap, 'تعداد رامتو', '#f2b705');
}
function renderProductInsight(wasteRows, ramtoRows){
  const wMap=new Map(); wasteRows.forEach(function(r){wMap.set(r.part,(wMap.get(r.part)||0)+r.totalWeight);});
  const rMap=new Map(); ramtoRows.forEach(function(r){rMap.set(r.product,(rMap.get(r.product)||0)+r.count);});
  const wArr=Array.from(wMap.entries()).sort(function(a,b){return b[1]-a[1];});
  const rArr=Array.from(rMap.entries()).sort(function(a,b){return b[1]-a[1];});
  let txt='';
  if (wArr.length) txt += 'بیشترین وزن ضایعات مربوط به «<b>'+wArr[0][0]+'</b>» با <b>'+fmt(wArr[0][1],1)+' kg</b> است. ';
  if (rArr.length) txt += 'بیشترین تعداد رامتو مربوط به «<b>'+rArr[0][0]+'</b>» با <b>'+fmt(rArr[0][1],0)+'</b> مورد است.';
  if (!txt) txt = 'داده‌ای برای تحلیل محصول در این بازه وجود ندارد.';
  document.getElementById('productInsight').innerHTML = '<div class="ins-title">تحلیل محصولات</div>'+txt;
}

function buildTableRows(ncInRange, ramtoInRange){
  let rows=[];
  if (state.tableType!=='ramto') rows=rows.concat(ncInRange.map(function(r){return {date:r.date, iso:r.iso, type:'نامنطبق', part:r.part, sinkType:r.sinkType, count:r.count, weight:r.weight, totalWeight:r.totalWeight, cause:r.rootCause, decision:r.decision};}));
  if (state.tableType!=='nc') rows=rows.concat(ramtoInRange.map(function(r){return {date:r.date, iso:r.iso, type:'رامتو', part:r.product, sinkType:r.sinkType, count:r.count, weight:r.weight, totalWeight:r.totalWeight, cause:r.cause, decision:'رامتو'};}));
  if (state.search){ const s=state.search.toLowerCase(); rows=rows.filter(function(r){return (r.part||'').toLowerCase().indexOf(s)>=0||(r.cause||'').toLowerCase().indexOf(s)>=0||(r.decision||'').toLowerCase().indexOf(s)>=0||(r.sinkType||'').toLowerCase().indexOf(s)>=0;}); }
  rows.sort(function(a,b){ let va=a[state.sortKey], vb=b[state.sortKey]; if(state.sortKey==='date'){va=a.iso; vb=b.iso;} if(typeof va==='string'){va=va||''; vb=vb||''; return state.sortDir==='asc'?va.localeCompare(vb):vb.localeCompare(va);} return state.sortDir==='asc'?(va-vb):(vb-va); });
  return rows;
}
function renderTable(ncInRange, ramtoInRange){
  const rows=buildTableRows(ncInRange, ramtoInRange);
  const totalPages=Math.max(1, Math.ceil(rows.length/state.pageSize));
  state.page=Math.min(state.page, totalPages);
  const start=(state.page-1)*state.pageSize;
  const pageRows=rows.slice(start, start+state.pageSize);
  document.getElementById('tableBody').innerHTML = pageRows.map(function(r){
    return '<tr><td>'+r.date+'</td><td><span class="badge '+(r.type==='رامتو'?'ramto':'waste')+'">'+r.type+'</span></td><td style="font-family:var(--sans); white-space:normal;">'+(r.part||'')+'</td><td>'+(r.sinkType||'')+'</td><td>'+fmt(r.count,0)+'</td><td>'+fmt(r.weight,3)+'</td><td>'+fmt(r.totalWeight,2)+'</td><td style="font-family:var(--sans); white-space:normal;">'+(r.cause||'')+'</td><td style="font-family:var(--sans);">'+(r.decision||'')+'</td></tr>';
  }).join('') || '<tr><td colspan="9" style="text-align:center; color:var(--muted); font-family:var(--sans); padding:20px;">رکوردی یافت نشد</td></tr>';
  document.getElementById('pageInfo').textContent = 'صفحه '+state.page+' از '+totalPages+' — '+rows.length+' رکورد';
  document.getElementById('prevPage').disabled = state.page<=1;
  document.getElementById('nextPage').disabled = state.page>=totalPages;
}

function setActivePreset(key){ document.querySelectorAll('#presets .chip').forEach(function(c){c.classList.toggle('active', c.dataset.preset===key);}); }
document.getElementById('presets').addEventListener('click', function(e){
  const chip=e.target.closest('.chip'); if(!chip) return;
  const preset=chip.dataset.preset; setActivePreset(preset);
  if (preset==='all'){ state.from=minISO; state.to=maxISO; }
  else { const days=parseInt(preset); const to=new Date(maxISO); const from=new Date(to); from.setDate(from.getDate()-days); state.to=maxISO; state.from = from.toISOString().slice(0,10)<minISO ? minISO : from.toISOString().slice(0,10); }
  syncDatePicker('from', state.from); syncDatePicker('to', state.to);
  state.page=1; render();
});
document.getElementById('granChips').addEventListener('click', function(e){
  const chip=e.target.closest('.chip'); if(!chip) return;
  document.querySelectorAll('#granChips .chip').forEach(function(c){c.classList.remove('active');});
  chip.classList.add('active'); state.gran=chip.dataset.gran; render();
});
document.getElementById('tableSearch').addEventListener('input', function(e){ state.search=e.target.value; state.page=1; render(); });
document.getElementById('tableType').addEventListener('change', function(e){ state.tableType=e.target.value; state.page=1; render(); });
document.querySelectorAll('thead th[data-key]').forEach(function(th){
  th.addEventListener('click', function(){ const key=th.dataset.key; if(state.sortKey===key) state.sortDir=state.sortDir==='asc'?'desc':'asc'; else { state.sortKey=key; state.sortDir='desc'; } render(); });
});
document.getElementById('prevPage').addEventListener('click', function(){ state.page--; render(); });
document.getElementById('nextPage').addEventListener('click', function(){ state.page++; render(); });

render();
}
