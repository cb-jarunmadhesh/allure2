/*
 *  Copyright 2016-2024 Qameta Software Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
package io.qameta.allure.derivedstatistics;

import io.qameta.allure.Aggregator2;
import io.qameta.allure.Constants;
import io.qameta.allure.ReportStorage;
import io.qameta.allure.core.Configuration;
import io.qameta.allure.core.LaunchResults;
import io.qameta.allure.entity.DerivedStats;
import io.qameta.allure.entity.ExecutorInfo;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

import static io.qameta.allure.executor.ExecutorPlugin.getLatestExecutor;

public class DerivedStatisticsPlugin implements Aggregator2 {

    protected static final String JSON_FILE_NAME = "statistics.json";

    @Override
    public void aggregate(final Configuration configuration,
                          final List<LaunchResults> launchesResults,
                          final ReportStorage storage) {
        final DerivedStatisticsData derivedStatisticsData = new DerivedStatisticsData()
                .setDerivedStats(new DerivedStats())
                .setReportName(getReportName(configuration, launchesResults));

        launchesResults.stream()
                .map(LaunchResults::getResults)
                .flatMap(Collection::stream)
                .forEach(result -> {
                    derivedStatisticsData.getDerivedStats().updateDerivedStats(result);
                });

        storage.addDataJson(String.format("%s/%s", Constants.WIDGETS_DIR, JSON_FILE_NAME), derivedStatisticsData);
    }

    private static String getReportName(final Configuration configuration,
                                        final List<LaunchResults> launchesResults) {
        final String reportName = configuration.getReportName();
        if (Objects.nonNull(reportName)) {
            return reportName;
        }

        return getLatestExecutor(launchesResults)
                .map(ExecutorInfo::getReportName)
                .map(String::trim)
                .orElse(Constants.DEFAULT_REPORT_NAME);
    }
}
