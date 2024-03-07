// Fetch education data from the specified URL and parse the response as JSON
const eduData = fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json"
  ).then((response) => response.json());
  
  // Fetch geographic data from the specified URL and parse the response as JSON
  const geoData = fetch(
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
  ).then((response) => response.json());
  
  // Wait for both promises to resolve and execute the callback function
  Promise.all([eduData, geoData]).then(([education, topology]) => {
    const w = 960; // Width of the SVG container
    const h = 600; // Height of the SVG container
  
    // Select the element with id "mapContainer" and append an SVG element to it
    const svg = d3
      .select("#mapContainer")
      .append("svg")
      .attr("width", w)
      .attr("height", h);
  
    // Convert the topology data to GeoJSON format
    const geojson = topojson.feature(topology, topology.objects.counties);
  
    // Create a path generator for the GeoJSON data
    const path = d3.geoPath();
  
    // Create a tooltip div element and set its initial opacity to 0
    const tooltip = d3
      .select("#mapContainer")
      .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0);
  
    // Function to determine the color based on the education percentage
    function colorMap(fips) {
      var eduPercentage = fips.bachelorsOrHigher;
      if (eduPercentage >= 57) {
        return "#1B5E20";
      } else if (eduPercentage < 57 && eduPercentage >= 48) {
        return "#2E7D32";
      } else if (eduPercentage < 48 && eduPercentage >= 39) {
        return "#388E3C";
      } else if (eduPercentage < 39 && eduPercentage >= 30) {
        return "#689F38";
      } else if (eduPercentage < 30 && eduPercentage >= 21) {
        return "#8BC34A";
      } else if (eduPercentage < 21 && eduPercentage >= 12) {
        return "#AED581";
      } else if (eduPercentage < 12 && eduPercentage >= 3) {
        return "#DCEDC8";
      }
    }
  
    // Append path elements to the SVG for each feature in the GeoJSON data
    svg
      .append("g")
      .selectAll("path")
      .data(geojson.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("class", "county")
      .attr("data-fips", (d) => education.find((x) => x.fips === d.id).fips)
      .attr(
        "data-education",
        (d) => education.find((x) => x.fips === d.id).bachelorsOrHigher
      )
      .attr(
        "data-county",
        (d) => education.find((x) => x.fips === d.id).area_name
      )
      .attr("data-state", (d) => education.find((x) => x.fips === d.id).state)
      .attr("fill", function (d) {
        var id = d.id;
        var fips = education.find((x) => x.fips === id);
        if (fips) {
          return colorMap(fips);
        }
      })
      .on("mouseover", function (event, d) {
        // Get the county, state, and education data for the hovered element
        var dataCounty = d3.select(this).attr("data-county");
        var dataState = d3.select(this).attr("data-state");
        var dataEducation = d3.select(this).attr("data-education");
  
        // Show the tooltip with the county, state, and education information
        tooltip.transition().duration(100).style("opacity", 0.7);
        tooltip
          .html(dataCounty + ", " + dataState + ": " + dataEducation + "%")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 50}px`)
          .attr("data-education", dataEducation);
      })
      .on("mouseout", (d) => {
        // Hide the tooltip when the mouse is moved out of the element
        tooltip.transition().duration(100).style("opacity", 0);
      });
  
    // Data for the legend
    const legendData = [
      { label: "", color: "transparent" },
      { label: "3%", color: colorMap({ bachelorsOrHigher: 3 }) },
      { label: "12%", color: colorMap({ bachelorsOrHigher: 12 }) },
      { label: "21%", color: colorMap({ bachelorsOrHigher: 21 }) },
      { label: "30%", color: colorMap({ bachelorsOrHigher: 30 }) },
      { label: "39%", color: colorMap({ bachelorsOrHigher: 39 }) },
      { label: "48%", color: colorMap({ bachelorsOrHigher: 48 }) },
      { label: "57%", color: colorMap({ bachelorsOrHigher: 57 }) },
      { label: "66%", color: "transparent" }
    ];
  
    const legendWidth = 300; // Width of the legend
    const legendHeight = 10; // Height of the legend
    const legendX = 550; // X-coordinate of the legend
    const legendY = 50; // Y-coordinate of the legend
  
    // Create the legend group and set its transform attribute
    const legend = svg
      .append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${legendX}, ${legendY})`);
  
    // Append rectangles to represent the legend color blocks
    const legendRects = legend
      .selectAll("rect")
      .data(legendData)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * (legendWidth / (legendData.length - 1)))
      .attr("y", 0)
      .attr("width", legendWidth / (legendData.length - 1))
      .attr("height", legendHeight)
      .attr("fill", (d) => d.color);
  
    // Append lines as ticks to mark the legend sections
    const legendTicks = legend
      .selectAll("line")
      .data(legendData.slice(1))
      .enter()
      .append("line")
      .attr("x1", (d, i) => (i + 1) * (legendWidth / (legendData.length - 1)))
      .attr("y1", 0)
      .attr("x2", (d, i) => (i + 1) * (legendWidth / (legendData.length - 1)))
      .attr("y2", legendHeight + 5)
      .attr("stroke", "black");
  
    // Append labels to display the legend text
    const legendLabels = legend
      .selectAll("text")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", (d, i) => i * (legendWidth / (legendData.length - 1)))
      .attr("y", legendHeight + 15)
      .text((d) => d.label);
  });
  