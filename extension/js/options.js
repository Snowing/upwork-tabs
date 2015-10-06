// Saves options to chrome.storage
function save_options() {
  var url = document.getElementById('url1').value;
  var period = document.getElementById('period').value;
  var open_apply = document.getElementById('open_apply').checked;
  var create_window = document.getElementById('create_window').checked;
  chrome.storage.sync.set({
    url1 : url,
    period: period,
    open_apply: open_apply,
    create_window: create_window
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    url1: "https://www.upwork.com/o/jobs/browse/?sort=relevance%2Bdesc",
    period:30,
    open_apply: false,
    create_window: true
  }, function(items) {
    document.getElementById('url1').value = items.url1;
    document.getElementById('period').value = items.period;
    document.getElementById('open_apply').checked = items.open_apply;
    document.getElementById('create_window').checked = create_window;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
