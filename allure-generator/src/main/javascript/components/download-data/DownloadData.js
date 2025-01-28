import { View } from "backbone.marionette";
import TestResultModel from "../../data/testresult/TestResultModel"
import { on } from "../../decorators";
import template from "./DownloadData.hbs";

class DownloadData extends View {
  template = template

  initialize({ collection, settings, state }) {
    this.collection = collection;
    this.downloadableData = this.collection.testResults
    this.settings = settings;
    this.state = state
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

  @on("click")
  async onClick() {

    const dataToDownload = []

    for(const data of this.downloadableData) {
      const model = new TestResultModel({ uid: data.uid });
      await model.fetch({
        url: model.url(),
        success: (testData) => {
          dataToDownload.push({
            name: testData.attributes.name,
            status: testData.attributes.status,
            startTime : new Date(testData.attributes.time.start).toString(),
            stopTime : new Date(testData.attributes.time.stop).toString(),
            duration: testData.attributes.time.duration,
            testMethod : testData.attributes.fullName.split(".").pop(),
            testClass: testData.attributes.fullName,
            description: testData.attributes.description
          })
        }
      });
    }

    const csvData = this.convertToCSV(dataToDownload);

    const downloadBlob = new Blob([csvData], { type: "text/csv" });
    const downloadUrl = URL.createObjectURL(downloadBlob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = "data.csv";
    link.click();
    URL.revokeObjectURL(downloadUrl);
  }
}

export default DownloadData;
