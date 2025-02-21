import { View } from "backbone.marionette";
import TestResultModel from "../../data/testresult/TestResultModel"
import { on } from "../../decorators";
import { getQueryParams } from "../../utils/queryParam";
import template from "./DownloadData.hbs";

class DownloadData extends View {
  template = template

  initialize({ collection, settings, state }) {
    this.collection = collection;
    this.downloadableData = this.collection.testResults
    this.settings = settings;
    this.state = state
    this.isLoading = false;
    this.listenTo(this.settings, "change", this.render);
  }

  applyFilters() {
    this.downloadableData = this.collection.testResults;
  }

  onBeforeRender() {
    this.applyFilters();
  }

  convertToCSV = (data) => {
    if (!data.length) {
      return ""
    }

    const headers = Object.keys(data[0]); // Extract the keys as CSV headers
    const rows = data.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || "")).join(",")
    );

    return [headers.join(","), ...rows].join("\n");
  };

  templateContext() {
    return {
      isLoading: this.isLoading
    }
  }

  @on("click")
  async onClick() {

    this.isLoading = true;
    this.render();

    const query = getQueryParams();
    if(Object.keys(query).length === 0) {
      alert("Please apply filters to download the data");
      this.isLoading = false;
      this.render();
      return;
    }

    const dataToDownload = []

    for(const data of this.downloadableData) {
      const model = new TestResultModel({ uid: data.uid });
      await model.fetch({
        url: model.url(),
        success: (testData) => {
          const suiteName = testData.attributes.labels.find(label => label.name === "parentSuite")?.value;
          const moduleName = suiteName? `${suiteName.split(" ")[0]}-testing`.toLowerCase() : "";
          const className = testData.attributes.fullName.split(".").slice(-2, -1)[0];

          dataToDownload.push({
            module: moduleName,
            parentSuite: suiteName,
            className: className,
            testMethod : testData.attributes.fullName.split(".").pop(),
            status: testData.attributes.status,
            name: testData.attributes.name,
            fullName: testData.attributes.fullName,
            description: testData.attributes.description,
            startTime : new Date(testData.attributes.time.start).toString(),
            stopTime : new Date(testData.attributes.time.stop).toString(),
            duration: testData.attributes.time.duration,
            retry: `${moduleName}.${className}`
          })
        }
      });
    }

    const csvData = this.convertToCSV(dataToDownload);

    const downloadBlob = new Blob([csvData], { type: "text/csv" });
    const downloadUrl = URL.createObjectURL(downloadBlob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "filtered-data.csv";
    link.click();
    URL.revokeObjectURL(downloadUrl);

    this.isLoading = false;
    this.render();
  }
}

export default DownloadData;
