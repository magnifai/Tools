const EXPORT_FILE_TYPE = "EXCELOPENXML"; // 'CSV', 'EXCELOPENXML', 'XML'
document.$ = $;

$yearInput = () => document.$("#rvMCDS_ctl04_ctl03_ddValue");
$leaInput = () => document.$("#rvMCDS_ctl04_ctl05_ddValue");
$schoolInput = () => document.$("#rvMCDS_ctl04_ctl07_ddValue");
$report = () => document.$("#VisibleReportContentrvMCDS_ctl09");

// checks for visibility of their loading spinner
const isLoading = () => $yearInput().disabled;
const waitUntilLoadingDone = async () => {
  const poll = resolve =>
    setTimeout(
      () => (!isLoading() ? resolve() : setTimeout(() => poll(resolve), 400)),
      1000
    );
  return new Promise(poll);
};

const downloadReport = async () => {
  $find("rvMCDS").exportReport(EXPORT_FILE_TYPE);
  return waitUntilLoadingDone();
};
const canDownloadReport = () =>
  !!$yearInput().value &&
  !!$leaInput().value &&
  !!$schoolInput().value &&
  $report().style["display"] !== "none";

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

// these don't change
const yearInputValues = Array.apply(null, $yearInput().options).map(
  o => o.value
);

// set input and wait for it to load the next step
const setInputValue = async ($input, val) => {
  $input.value = val;
  if ($input.onchange) {
    $input.onchange();
  }

  return waitUntilLoadingDone();
};

// "click" load report button and wait for the page to complete
const loadReportData = async () => {
  document.$("#rvMCDS_ctl04_ctl00").click();
  return waitUntilLoadingDone();
};

// downloads the CSVs
const downloadAllData = async () => {
  await asyncForEach(yearInputValues, async yearInputValue => {
    await setInputValue($yearInput(), yearInputValue);
    const leaInputValues = Array.apply(null, $leaInput().options).map(
      o => o.value
    );

    await asyncForEach(leaInputValues, async leaInputValue => {
      if (leaInputValue === "0") {
        return;
      }

      await setInputValue($leaInput(), leaInputValue);
      const schoolInputValues = Array.apply(null, $schoolInput().options).map(
        o => o.value
      );

      await asyncForEach(schoolInputValues, async schoolInputValue => {
        if (schoolInputValue === "0") {
          return;
        }

        await setInputValue($schoolInput(), schoolInputValue);
        await loadReportData();

        if (!canDownloadReport()) {
          await setInputValue($yearInput(), yearInputValue);
          await setInputValue($leaInput(), leaInputValue);
          await setInputValue($schoolInput(), schoolInputValue);
          await loadReportData();
        }

        await downloadReport();
      });
    });
  });
};

await downloadAllData();
