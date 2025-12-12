<head>
  <meta name="description" content="Take part in our community contests and show off your skills. Whether you're a pro or a beginner, there's a contest for everyone." />
</head>

<main id="careerhub_root"></main>

<#-- Khorso classic environment - with attempt recovery blocks -->
<#if !user.anonymous>
  <#attempt>
    <#assign query = "select first_name, last_name, sso_id from users where id = '${user.id}'" />
    <#assign user_details = restadmin("2.0", "/search?q=" + query?url) />

    <#-- Handle potential null or empty sso_id safely -->
    <#assign sso_id = user_details.data.items[0].sso_id!"" />
    <#assign nps_sso_id = sso_id?has_content?then(sso_id, "3fa85f64-5717-4562-b3fc-2c963f66afa6") />
  <#recover>
    <#-- Recovery block: Set default values if query or API call fails -->
    <#assign query = "" />
    <#assign user_details = {} />
    <#assign sso_id = "" />
    <#assign nps_sso_id = "3fa85f64-5717-4562-b3fc-2c963f66afa6" />
  </#attempt>
  <div id="nps-display"></div>


  <script>
    var nps_user_id = "${user.id}";
    var nps_first_name = "${user_details.data.items[0].first_name!''}";
    var nps_last_name = "${user_details.data.items[0].last_name!''}";
    var nps_sso_id = "${nps_sso_id}";

    console.log("nps_user_id:", nps_user_id);
    console.log("nps_first_name:", nps_first_name);
    console.log("nps_last_name:", nps_last_name);
    console.log("nps_sso_id:", nps_sso_id);
  </script>
</#if>
<script src="${asset.get('/html/assets/officebrowserfeedback_floodgate.js')}"></script>
<script src="${asset.get('/html/assets/OCVApp.js')}"></script>