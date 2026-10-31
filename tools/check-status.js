/* Проверка status.json перед сохранением: node tools/check-status.js
   Код выхода 1 и список ошибок — файл публиковать нельзя. */
var OFFICIAL=/(^|\.)(novo-sibirsk\.ru|gorsovetnsk\.ru|nso\.ru|gge\.ru|zakupki\.gov\.ru|gov\.ru)$/;
var OBJECTS=['zniva2','gusin','molod','voloch','l1n','l1w','l2w','l3'];
// издания одного холдинга считаются одним источником
var GROUPS=[['ria.ru','1prime.ru','rsport.ria.ru','sputniknews.ru'],['ngs.ru','ngs.tv','nsk54.online','nsk54.ru'],['vn.ru','infopro54.ru']];
function host(u){var h=u.replace(/^https?:\/\//,'').split('/')[0].replace(/^(www|m)\./,'').toLowerCase();
  var g=GROUPS.filter(function(a){return a.some(function(d){return h===d||h.slice(-d.length-1)==='.'+d;});})[0];return g?g[0]:h;}
function check(d,today){var e=[],has=function(o,k){return Object.prototype.hasOwnProperty.call(o,k);};
  var date=/^\d{4}-\d{2}-\d{2}$/;
  if(!date.test(d.checked||''))e.push('checked: нужна дата ГГГГ-ММ-ДД');
  if(d.checked>today)e.push('checked: дата из будущего');
  var entry=function(id,x,i,prev){var w=id+' #'+(i+1)+': ';
    if(!has(d.stages,x.stage))e.push(w+'неизвестный этап '+x.stage);
    if(!date.test(x.date||'')||x.date>today)e.push(w+'неверная дата '+x.date);
    if(prev&&x.date<prev.date)e.push(w+'дата раньше предыдущей записи');
    if(!x.note)e.push(w+'нет пояснения');
    if(!Array.isArray(x.src)||!x.src.length)return e.push(w+'нет источника');
    x.src.forEach(function(s){if(!/^https:\/\//.test(s.u||'')||!s.t)e.push(w+'источник без https-ссылки или названия');});
    // автоматическая запись: официальный домен либо два независимых издания
    if(x.auto){var hs={},off=false;x.src.forEach(function(s){var h=host(s.u);hs[h]=1;if(OFFICIAL.test(h))off=true;});
      if(!off&&Object.keys(hs).length<2)e.push(w+'нужен официальный источник или два разных издания');
      if(!x.quote)e.push(w+'нет цитаты из источника');}};
  var rec=function(id,r){if(!r.history||!r.history.length)return e.push(id+': пустая история');
    r.history.forEach(function(x,i){entry(id,x,i,r.history[i-1]);});};
  OBJECTS.forEach(function(k){if(!d.objects[k])e.push('нет объекта '+k);});
  Object.keys(d.objects).forEach(function(k){if(OBJECTS.indexOf(k)<0)e.push('лишний объект '+k);rec(k,d.objects[k]);});
  Object.keys(d.stations).forEach(function(k){if(!/^[a-z0-9-]+$/.test(k))e.push('неверный id станции '+k);rec(k,d.stations[k]);});
  return e;}
if(typeof module!=='undefined'&&require.main===module){
  var d=JSON.parse(require('fs').readFileSync(require('path').join(__dirname,'..','status.json'),'utf8'));
  var errs=check(d,new Date().toISOString().slice(0,10));
  if(errs.length){console.error(errs.join('\n'));process.exit(1);}
  console.log('status.json в порядке');}
