d3.csv("https://raw.githubusercontent.com/kookeej/infovis/master/preprocessed_movielense_100k.csv")
  .then(function(data) {
    data.forEach(function(d) {
      d.age = +d.age;
      d.user_id = +d.user_id;
    });

    const processedData = data.reduce(function(acc, curr) {
      const existingUser = acc.find(function(user) {
        return user.user_id === curr.user_id;
      });
      if (existingUser) {
        existingUser.count++;
      } else {
        acc.push({ user_id: curr.user_id, count: 1, age: curr.age, gender: curr.gender, occupation: curr.occupation });
      }
      return acc;
    }, []);

    const svgWidth = 900;
    const svgHeight = 350;
    const margin = { top: 20, right: 10, bottom: 30, left: 40 };
    const width = (svgWidth - margin.left - margin.right) / 2;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#scatterplot_container")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, function(d) { return d.age; })])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(processedData, function(d) { return d.count; })])
      .range([height, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(["M", "F"])
      .range(["#66a3ff", "#ff6666"]);

    const circles = svg.selectAll("circle")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return xScale(d.age);
      })
      .attr("cy", function(d) {
        return yScale(d.count);
      })
      .attr("r", 3)
      .style("fill", function(d) {
        return colorScale(d.gender);
      })
      .style("stroke", "none");

    const xTickLabels = ["", "Teenagers", "20's", "30's", "40's", "50's", "60+"];

    const xAxis = d3.axisBottom(xScale)
      .tickFormat(function(d, i) {
        return xTickLabels[i]; // Use the custom tick labels
      });

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Age");

    const yAxis = d3.axisLeft(yScale);
    svg.append("g")
        .call(yAxis);

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Number of Movie Visits");

    const histogramSvg = d3.select("#histogram_container2")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", "translate(" + (margin.left + width) + "," + margin.top + ")");

    histogramSvg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Age Group");

    histogramSvg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - height / 2)
        .attr("y", 0 - margin.left)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count");

    const histogramContainer = histogramSvg.append("g");

    function updateHistogram(selectedData) {
        const ageGroups = {
          "Teenagers": { "M": 0, "F": 0 },
          "20's": { "M": 0, "F": 0 },
          "30's": { "M": 0, "F": 0 },
          "40's": { "M": 0, "F": 0 },
          "50's": { "M": 0, "F": 0 },
          "60+": { "M": 0, "F": 0 }
        };

        selectedData.forEach(function(d) {
          if (d.age >= 0 && d.age <= 19) {
            ageGroups["Teenagers"][d.gender]++;
          } else if (d.age >= 20 && d.age <= 29) {
            ageGroups["20's"][d.gender]++;
          } else if (d.age >= 30 && d.age <= 39) {
            ageGroups["30's"][d.gender]++;
          } else if (d.age >= 40 && d.age <= 49) {
            ageGroups["40's"][d.gender]++;
          } else if (d.age >= 50 && d.age <= 59) {
            ageGroups["50's"][d.gender]++;
          } else {
            ageGroups["60+"][d.gender]++;
          }
        });

        const histogramData = Object.keys(ageGroups).map(function(key) {
          return {
            ageGroup: key,
            maleCount: ageGroups[key]["M"],
            femaleCount: ageGroups[key]["F"]
          };
        });

        const xScaleHistogram = d3.scaleBand()
          .domain(histogramData.map(function(d) { return d.ageGroup; }))
          .range([0, width])
          .padding(0.1);
        
        
        const yScaleHistogram = d3.scaleLinear()
          .domain([0, d3.max(histogramData, function(d) { return d.maleCount + d.femaleCount; })])
          .range([height, 0]);

        const bars = histogramContainer.selectAll("g")
            .data(histogramData);

        const enterBars = bars.enter()
          .append("g")
          .attr("transform", function(d) {
            return "translate(" + xScaleHistogram(d.ageGroup) + ",0)";
          });
        

        enterBars.append("rect")
          .attr("x", 0)
          .attr("y", function(d) {
            return yScaleHistogram(d.maleCount + d.femaleCount);
          })
          .attr("width", xScaleHistogram.bandwidth())
          .attr("height", function(d) {
            return height - yScaleHistogram(d.maleCount + d.femaleCount);
          })
          .style("fill", function(d) {
            return colorScale("M");
          })
          .style("fill-opacity", 0.7);;

        enterBars.append("rect")
          .attr("x", 0)
          .attr("y", function(d) {
            return yScaleHistogram(d.femaleCount);
          })
          .attr("width", xScaleHistogram.bandwidth())
          .attr("height", function(d) {
            return height - yScaleHistogram(d.femaleCount);
          })
          .style("fill", function(d) {
            return colorScale("F");
          })
          .style("fill-opacity", 0.7);;

        const mergedBars = enterBars.merge(bars);

        mergedBars.select("rect:nth-child(1)")
          .transition()
          .duration(500)
          .attr("y", function(d) {
            return yScaleHistogram(d.maleCount + d.femaleCount);
          })
          .attr("height", function(d) {
            return height - yScaleHistogram(d.maleCount + d.femaleCount);
          });

        mergedBars.select("rect:nth-child(2)")
          .transition()
          .duration(500)
          .attr("y", function(d) {
            return yScaleHistogram(d.femaleCount);
          })
          .attr("height", function(d) {
            return height - yScaleHistogram(d.femaleCount);
          });

        bars.exit().remove();

        const xAxisHistogram = d3.axisBottom(xScaleHistogram);
        histogramContainer.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxisHistogram);

        const yAxisHistogram = d3.axisLeft(yScaleHistogram);
        histogramContainer.append("g")
            .attr("class", "y-axis")
            .call(yAxisHistogram);

        histogramContainer.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - height / 2)
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Count");
      }

      updateHistogram(processedData);

      function handleBrush() {
        const extent = d3.brushSelection(this);

        if (extent) {
          const [[x0, y0], [x1, y1]] = extent;

          const selectedData = processedData.filter(function(d) {
            const cx = xScale(d.age);
            const cy = yScale(d.count);
            return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
          });
          updateHistogram(selectedData);
        } else {
          updateHistogram(processedData);
        }
      }

      const brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("brush", handleBrush)
        .on("end", handleBrush)
      svg.append("g")
        .attr("class", "brush")
        .call(brush);
    });
