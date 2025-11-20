<template>
  <div class="manage-layout">
    <aside class="sidebar">
      <div class="logo">活动管理</div>
      <nav class="menu">
        <a class="menu__item active">发布活动</a>
        <a class="menu__item">审核报名</a>
        <a class="menu__item">查看统计</a>
        <a class="menu__item">签到管理</a>
      </nav>
    </aside>

    <main class="content"></main>
  </div>
</template>

<script setup>
</script>

<style scoped>
.manage-layout{
  display:flex;
  min-height:100vh;
  background:#f6f4fb;
  color:#2c2c2c;
}
.sidebar{
  width:220px;
  background:#fff;
  padding:24px 16px;
  box-shadow:5px 0 20px rgba(0,0,0,0.05);
}
.logo{
  font-weight:700;
  font-size:22px;
  color:#764ba2;
  margin-bottom:30px;
}
.menu{
  display:flex;
  flex-direction:column;
  gap:12px;
}
.menu__item{
  padding:12px 16px;
  border-radius:10px;
  font-size:15px;
  color:#666;
  text-decoration:none;
  cursor:pointer;
  transition:all .2s;
}
.menu__item.active,
.menu__item:hover{
  background:#764ba2;
  color:#fff;
  font-weight:600;
}
.content{
  flex:1;
  padding:32px;
}
@media (max-width:1200px){
  .stats-grid{
    grid-template-columns:repeat(2,minmax(0,1fr));
  }
  .panels{
    grid-template-columns:1fr;
  }
}
</style>

