<template>
  <div>
    <div class="content-container">
      <h1>Coming Soon</h1>
      <p class="usa-prose">
        The <span>USGS National Integrated Water Availability Assessments</span> is proud to announce the
        upcoming release of the National Integrated Water Availability Assessments map.
        Set to be released in early 2020, this application will provide users with an interactive graphic showing the latest
        available daily estimates of natural water storage for approximately 110,000 regions across the
        lower forty-eight states. Natural water storage shown will include water present on the landscape such as
        standing water and water on trees, snowpack, soil water, and shallow groundwater.
        It does not include water in rivers or deep groundwater. Map color shading will indicate the current natural
        water storage relative to historical conditions for this time of year.
      </p>
      <p class="usa-prose">Please stay tuned for updates as the release date approaches . . .</p>
    </div>
  </div>
</template>

<script>
    export default {
        name: "ComingSoonPlaceHolder"
    }
</script>

<style scoped lang="scss">
  h1 {
    /*color: #E5E5E5;*/
    color: #00264c;
  }
  div {
    /*background-color: #2c3e50;*/
    padding: 2em;

    .content-container {
      max-width: 1200px;
      margin: auto;
      width: 90%;
    }
  }
  .usa-prose {
    /*color: white;*/
    color: #00264c;

    span {
      font-weight: bold;
    }
  }


</style>