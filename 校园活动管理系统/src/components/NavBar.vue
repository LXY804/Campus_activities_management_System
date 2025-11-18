<template>
    <header class="topbar">
      <div class="container topbar__inner">
        <div class="brand">
          <img class="brand__logo" src="@/assets/header-logo.png" alt="武汉理工大学">
        </div>
        <nav class="nav">
          <a class="nav__link active" href="#">首页</a>
          <a class="nav__link" href="#">活动宣传</a>
          <a class="nav__link" href="#">论坛交流</a>
          <a class="nav__link" href="#">积分礼品</a>
          <a class="nav__link" href="#">活动信息</a>
          <a class="nav__link" href="#">校园资讯</a>
        </nav>
        <div class="actions">
          <button class="icon-btn" title="搜索" aria-label="搜索">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" stroke-width="2.5"/>
              <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </button>
          <button class="btn ghost" title="登录">登录</button>
          <button class="icon-btn" title="系统公告">🔔系统公告</button>
        </div>
      </div>
    </header>
  </template>
  
  <style scoped>
  .topbar{position:sticky;top:0;z-index:100;background:hsl(220, 91%, 30%);color:#fff;border-bottom:1px solid rgba(255,255,255,.08)}
  .container{width:100%;max-width:1200px;padding:0 16px;margin:0 auto}
  .topbar__inner{display:flex;align-items:center;height:64px;gap:16px}
  .brand{display:flex;align-items:center;gap:8px}
  .brand__logo{height:40px;max-width:180px;object-fit:contain}
  .nav{display:flex;gap:26px;margin-left:50px;flex:1}
  .nav__link{color:#dfe8ff;text-decoration:none;padding:8px 10px;border-radius:8px;transition:background-color .2s,color .2s;font-size:18px}
  .nav__link:hover{background:rgba(255,255,255,.12);color:#fff}
  .nav__link.active{background:#fff;color:#0d47a1;font-weight:700}
  .actions{display:flex;align-items:center;gap:20px}
  .icon-btn{
    display:flex;
    align-items:center;
    justify-content:center;
    height:36px;
    min-width:36px;
    padding:0 10px;
    border-radius:8px;
    border:0;
    background:rgba(255,255,255,.16);
    color:#fff;
    cursor:pointer
    }
  .icon-btn:hover{
    background:rgba(255,255,255,.12);
    border-color:#fff
  }
  .icon-btn:focus-visible{outline:0;box-shadow:0 0 0 2px #fff}
  .icon{width:20px;height:20px;display:block}
  .btn{height:36px;padding:0 14px;border-radius:8px;border:none;cursor:pointer}
  .btn.ghost{background:#fff;color:#0d47a1;font-weight:600}
  </style>