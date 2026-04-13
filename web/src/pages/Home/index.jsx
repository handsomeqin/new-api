/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React, { useContext, useEffect, useState } from 'react';
import {
  Button,
  Input,
  ScrollList,
  ScrollItem,
  Card,
} from '@douyinfe/semi-ui';
import { API, showError, copy, showSuccess } from '../../helpers';
import { useIsMobile } from '../../hooks/common/useIsMobile';
import { API_ENDPOINTS } from '../../constants/common.constant';
import { StatusContext } from '../../context/Status';
import { useActualTheme } from '../../context/Theme';
import { marked } from 'marked';
import { useTranslation } from 'react-i18next';
import {
  IconGithubLogo,
  IconPlay,
  IconFile,
  IconCopy,
  IconKey,
  IconLink,
  IconGift,
} from '@douyinfe/semi-icons';
import { Link } from 'react-router-dom';
import NoticeModal from '../../components/layout/NoticeModal';

const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const actualTheme = useActualTheme();
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [noticeVisible, setNoticeVisible] = useState(false);
  const isMobile = useIsMobile();
  const isDemoSiteMode = statusState?.status?.demo_site_enabled || false;
  const docsLink = statusState?.status?.docs_link || '';
  const serverAddress = statusState?.status?.server_address || `${window.location.origin}`;
  const endpointItems = API_ENDPOINTS.map((e) => ({ value: e }));
  const [endpointIndex, setEndpointIndex] = useState(0);
  const [openclawUrl, setOpenclawUrl] = useState('http://ai.bbs5050.com/v1');
  const [generatedKey, setGeneratedKey] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const isChinese = i18n.language.startsWith('zh');

  // 生成随机密钥令牌
  const generateRandomKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 生成邀请链接
  const generateInviteLink = () => {
    try {
      // 尝试从本地存储获取用户信息
      const userStr = localStorage.getItem('user');
      let affCode = 'guest';
      
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user && user.aff_code) {
            affCode = user.aff_code;
          } else if (user && user.id) {
            affCode = user.id;
          } else if (user && user.username) {
            affCode = user.username;
          }
        } catch (e) {
          console.error('解析用户信息失败:', e);
        }
      }
      
      // 生成邀请链接，指向注册页面
      return `${window.location.origin}/register?aff=${encodeURIComponent(affCode)}`;
    } catch (e) {
      console.error('生成邀请链接失败:', e);
      return `${window.location.origin}/register?aff=guest`;
    }
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

      // 如果内容是 URL，则发送主题模式
      if (data.startsWith('https://')) {
        const iframe = document.querySelector('iframe');
        if (iframe) {
          iframe.onload = () => {
            iframe.contentWindow.postMessage({ themeMode: actualTheme }, '*');
            iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
          };
        }
      }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  // 获取用户信息和真实的 API 密钥
  const fetchUserInfo = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          // 获取用户的 API 密钥
          const tokensRes = await API.get('/api/token');
          if (tokensRes.data.success && tokensRes.data.data && tokensRes.data.data.length > 0) {
            // 使用第一个令牌作为默认密钥
            setGeneratedKey(tokensRes.data.data[0].key);
            localStorage.setItem('openclaw_key', tokensRes.data.data[0].key);
          }
          
          // 获取用户的详细信息，确保 aff_code 是最新的
          const userRes = await API.get('/api/user/self');
          if (userRes.data.success && userRes.data.data) {
            const userData = userRes.data.data;
            // 确保邀请链接使用真实的 aff_code
            if (userData.aff_code) {
              setInviteLink(`${window.location.origin}/register?aff=${encodeURIComponent(userData.aff_code)}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const handleCopyBaseURL = async () => {
    const ok = await copy(serverAddress);
    if (ok) {
      showSuccess(t('已复制到剪切板'));
    }
  };

  const handleCopyKey = async () => {
    const ok = await copy(generatedKey);
    if (ok) {
      showSuccess(t('已复制密钥到剪切板'));
    }
  };

  const handleCopyInviteLink = async () => {
    const ok = await copy(inviteLink);
    if (ok) {
      showSuccess(t('已复制邀请链接到剪切板'));
    }
  };

  const regenerateKey = () => {
    const newKey = generateRandomKey();
    setGeneratedKey(newKey);
    localStorage.setItem('openclaw_key', newKey);
    showSuccess(t('已生成新密钥'));
  };

  useEffect(() => {
    const checkNoticeAndShow = async () => {
      const lastCloseDate = localStorage.getItem('notice_close_date');
      const today = new Date().toDateString();
      if (lastCloseDate !== today) {
        try {
          const res = await API.get('/api/notice');
          const { success, data } = res.data;
          if (success && data && data.trim() !== '') {
            setNoticeVisible(true);
          }
        } catch (error) {
          console.error('获取公告失败:', error);
        }
      }
    };

    checkNoticeAndShow();
  }, []);

  useEffect(() => {
    // 直接设置为新的首页内容
    setHomePageContentLoaded(true);
    
    // 新的首页内容
    const newHomeContent = `
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 0; }
        .text-future { letter-spacing: -0.045em; font-weight: 600; }
        .hero-bg { background: linear-gradient(135deg, #f8f4ff 0%, #e0f2fe 45%, #f3e8ff 100%); }
        .dark-bg { background-color: #010120; }
        .sharp { border-radius: 4px; }
        .comfort { border-radius: 12px; }
        .shadow-brand { box-shadow: 0 8px 20px rgba(1, 1, 32, 0.08); }
        .mono-label { font-family: ui-monospace, monospace; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.7rem; }
        .model-icon { height: 60px; width: 60px; background: linear-gradient(135deg, #ef2cc1, #fc4c02); border-radius: 16px; }
        .btn-loading { opacity: 0.6; pointer-events: none; }
        /* 黑色背景上的卡片底纹效果 */
        .dark-bg .comfort {
          background-image: radial-gradient(circle at 100% 100%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
          background-size: 100% 100%, 100% 100%;
          background-position: right bottom, left top;
          background-repeat: no-repeat;
        }
      </style>
      


      <!-- Hero 主视觉 -->
      <section class="hero-bg pt-24 pb-20 text-center relative overflow-hidden">
        <div class="max-w-5xl mx-auto px-6 relative">
          <div class="inline-flex items-center gap-2 bg-white/70 px-6 py-2 sharp border border-black/10 mb-8">
            <span class="mono-label text-[#ef2cc1]">大模型服务平台</span>
          </div>
          <h1 class="text-5xl md:text-7xl leading-none font-semibold text-future tracking-tighter mb-6">
            让 AI 客服与内容生产<br>稳定落地
          </h1>
          <p class="max-w-2xl mx-auto text-xl text-gray-700 mb-10">
            预部署模型 · 零运维 · 高性价比 · 国产合规<br>
            直接通过 API / 控制台调用，无需自建服务器
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button onclick="showTrialModal()" class="px-12 py-5 bg-gray-200 text-black text-lg font-medium sharp hover:bg-gray-300 transition shadow-brand">立即免费试用</button>
            <a href="#guarantee" class="px-12 py-5 border-2 border-black/30 text-lg font-medium sharp hover:bg-white/60">了解服务保障 →</a>
          </div>
        </div>
      </section>

      <!-- 核心价值短句 -->
      <section class="py-12 bg-white border-b">
        <div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div><div class="w-12 h-12 bg-gradient-to-br from-[#ef2cc1] to-[#fc4c02] rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3">🚀</div><div class="font-medium">开箱即用</div><div class="text-xs text-gray-500">API / 控制台直接调用</div></div>
          <div><div class="w-12 h-12 bg-gradient-to-br from-[#bdbbff] to-blue-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3">🛡️</div><div class="font-medium">稳定商用</div><div class="text-xs text-gray-500">7×24 集群冗余</div></div>
          <div><div class="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3">🇨🇳</div><div class="font-medium">国产合规</div><div class="text-xs text-gray-500">数据安全可控</div></div>
          <div><div class="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-3">💰</div><div class="font-medium">高性价比</div><div class="text-xs text-gray-500">省去硬件与运维成本</div></div>
        </div>
      </section>

      <!-- 模型能力 -->
      <section id="models" class="py-20 dark-bg text-white">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-12"><span class="mono-label text-[#bdbbff]">支持模型</span><h2 class="text-4xl text-future tracking-tighter mt-3">主流国产大模型 · 按 Token 计费</h2></div>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="comfort bg-white/10 border border-white/20 p-8 text-center"><div class="w-16 h-16 bg-gradient-to-br from-[#ef2cc1] to-[#fc4c02] rounded-lg flex items-center justify-center text-white text-2xl mx-auto mb-6"><img src="/deepseek.svg" alt="DeepSeek" class="w-12 h-12 object-contain" /></div><div class="font-medium text-xl mb-3">DeepSeek 系列</div><p class="text-gray-300 text-sm mb-4">强推理、代码生成、数理逻辑</p><p class="text-gray-400 text-xs">国产之光 数学与代码能力达国际一流水平</p></div>
            <div class="comfort bg-white/10 border border-white/20 p-8 text-center"><div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl mx-auto mb-6"><img src="/qwen.svg" alt="Qwen" class="w-12 h-12 object-contain" /></div><div class="font-medium text-xl mb-3">Qwen 系列</div><p class="text-gray-300 text-sm mb-4">指令跟随、内容创作、多轮对话</p><p class="text-gray-400 text-xs">阿里云通义千问 中文创作理解与逻辑推理能力卓越</p></div>
            <div class="comfort bg-white/10 border border-white/20 p-8 text-center"><div class="w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-2xl mx-auto mb-6"><img src="/minimax.svg" alt="MiniMax" class="w-12 h-12 object-contain" /></div><div class="font-medium text-xl mb-3">MiniMax 系列</div><p class="text-gray-300 text-sm mb-4">超长上下文、Agent 编排</p><p class="text-gray-400 text-xs">支持 400 万 token 超长上下文，深度 Agent 编排满足复杂业务场景</p></div>
          </div>
        </div>
      </section>

      <!-- 价格套餐 -->
      <section id="pricing" class="py-20 bg-white pricing-section">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-12"><span class="mono-label text-[#ef2cc1]">透明计费</span><h2 class="text-4xl text-future tracking-tighter mt-3">按 Token + 包月套餐</h2></div>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="comfort border border-black/20 p-10"><h3 class="text-2xl font-medium mb-6">按 Token 计费</h3><div class="text-4xl font-semibold text-future mb-2">0.1~5元 / 百万</div><div class="text-sm text-gray-500 mb-8">比官网优惠30%</div><a href="/console" class="w-full py-4 bg-white text-black border border-black/20 sharp hover:bg-black/5 flex items-center justify-center">立即开通</a></div>
            <div class="comfort border border-black/20 p-10"><h3 class="text-2xl font-medium mb-6">Lite 基础套餐</h3><div class="text-5xl font-semibold text-future mb-2">20元 / 月</div><div class="text-sm text-gray-500 mb-8">1200 次请求/ 5 小时；9000 次请求/周；18000 次请求/月 超级划算</div><a href="/console" class="w-full py-4 bg-white text-black border border-black/20 sharp hover:bg-black/5 flex items-center justify-center">开通 Lite</a></div>
            <div class="comfort border-2 border-[#ef2cc1] p-10 relative"><div class="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ef2cc1] text-white text-xs px-6 py-1 sharp">推荐</div><h3 class="text-2xl font-medium mb-6">Pro 高级套餐</h3><div class="text-5xl font-semibold text-future mb-2">100元 / 月</div><div class="text-sm text-gray-500 mb-8">6000 次请求/5 小时 ；45000 次请求/周 ； 90000 次请求/月 安心无忧</div><a href="/console" class="w-full py-4 bg-white text-black border border-black/20 sharp hover:bg-black/5 flex items-center justify-center">开通 Pro</a></div>
          </div>
        </div>
      </section>

      <!-- 稳定保障模块 -->
      <section id="guarantee" class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">
          <div>
            <span class="mono-label text-[#bdbbff]">服务保障</span>
            <h2 class="text-4xl text-future tracking-tighter mt-3 mb-8">稳定保障 · 裸金属服务集群</h2>
            <div class="space-y-8">
              <div class="flex gap-6">
                <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl">🛡️</div>
                <div>
                  <div class="font-medium text-lg">7×24 小时稳定运行</div>
                  <div class="text-gray-600">集群冗余架构，峰值期自动扩容，可用率 99.9%+</div>
                </div>
              </div>
              <div class="flex gap-6">
                <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center text-3xl">🔒</div>
                <div>
                  <div class="font-medium text-lg">国产合规 · 数据安全</div>
                  <div class="text-gray-600">国内节点部署，资源隔离，符合企业商业化合规要求</div>
                </div>
              </div>
              <div class="flex gap-6">
                <div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-3xl">📞</div>
                <div>
                  <div class="font-medium text-lg">专业技术支持</div>
                  <div class="text-gray-600">工单 + 专属对接，接入指导 &lt;10 分钟，7×24 响应</div>
                </div>
              </div>
            </div>
          </div>
          <div class="h-full flex items-center justify-center">
              <div class="w-full h-64 rounded-2xl shadow-brand flex items-center justify-center">
                <img src="/保障.jpeg" alt="服务保障" class="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>
        </div>
      </section>

      <!-- 性价比对比 -->
      <section class="py-20 bg-gray-50">
        <div class="max-w-6xl mx-auto px-6">
          <div class="text-center mb-12"><span class="mono-label text-[#ef2cc1]">高性价比</span><h2 class="text-4xl text-future tracking-tighter mt-3">比自建更省心省钱</h2></div>
          <div class="grid md:grid-cols-2 gap-12">
            <div class="comfort bg-white p-10 shadow-brand">
              <h3 class="font-medium text-xl mb-6 text-red-600">自建模型成本</h3>
              <ul class="space-y-4 text-sm">
                <li class="flex justify-between"><span>GPU 服务器采购</span><span class="font-medium">高</span></li>
                <li class="flex justify-between"><span>部署与环境优化</span><span class="font-medium">复杂</span></li>
                <li class="flex justify-between"><span>运维 + 电费 + 带宽</span><span class="font-medium">持续高</span></li>
                <li class="flex justify-between"><span>月产10万篇文案示例</span><span class="font-medium text-red-600">≈5万元/月</span></li>
              </ul>
            </div>
            <div class="comfort bg-white p-10 shadow-brand">
              <h3 class="font-medium text-xl mb-6 text-emerald-600">云基算力</h3>
              <ul class="space-y-4 text-sm">
                <li class="flex justify-between"><span>零硬件采购</span><span class="font-medium text-emerald-600">0元</span></li>
                <li class="flex justify-between"><span>平台预部署完成</span><span class="font-medium text-emerald-600">开箱即用</span></li>
                <li class="flex justify-between"><span>按量 / 包月计费</span><span class="font-medium text-emerald-600">灵活</span></li>
                <li class="flex justify-between"><span>月产10万篇文案示例</span><span class="font-medium text-emerald-600">≈8000元/月</span></li>
              </ul>
            </div>
          </div>
          <div class="mt-10 text-center text-emerald-600 font-medium">
            一句话中翻中：自建比买官网便宜，而买云基成本仅为自建的 1/6，省去 70% 搭建与运维费用
          </div>
        </div>
      </section>

      <!-- 行业案例 -->
      <section id="cases" class="py-20 dark-bg text-white">
        <div class="max-w-6xl mx-auto px-6">
          <h2 class="text-4xl text-future tracking-tighter text-center mb-12">服务于头部客户</h2>
          <div class="grid md:grid-cols-3 gap-8">
            <div class="comfort bg-white/10 border border-white/20 p-8">
              <div class="w-full h-32 rounded mb-6 flex items-center justify-center">
                <img src="/中国移动.jpeg" alt="中国移动 AI 客服" class="w-full h-full object-cover rounded" />
              </div>
              <h3 class="font-medium">中国移动 AI 客服</h3>
              <p class="text-sm text-gray-300 mt-3">智能客服系统日均处理 10 万+ 会话请求，高峰期并发提升 5 倍，准确率与响应速度均大幅领先，极大减轻人工坐席压力</p>
            </div>
            <div class="comfort bg-white/10 border border-white/20 p-8">
              <div class="w-full h-32 rounded mb-6 flex items-center justify-center">
                <img src="/人保财险.jpeg" alt="人保财险 知识助手" class="w-full h-full object-cover rounded" />
              </div>
              <h3 class="font-medium">人保财险 知识助手</h3>
              <p class="text-sm text-gray-300 mt-3">内嵌大模型知识中台，业务人员查询效率提升 4 倍，理赔知识检索耗时缩短 70%，全面符合国产化合规要求</p>
            </div>
            <div class="comfort bg-white/10 border border-white/20 p-8">
              <div class="w-full h-32 rounded mb-6 flex items-center justify-center">
                <img src="/自媒体.jpeg" alt="自媒体工作室" class="w-full h-full object-cover rounded" />
              </div>
              <h3 class="font-medium">自媒体工作室</h3>
              <p class="text-sm text-gray-300 mt-3">利用 AI 批量生成内容，单周产出量从 20 条跃升至 60 条，创意生产效率提升 3 倍，爆款内容孵化更轻松</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 关于我们 -->
      <section id="about" class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-6 text-center">
          <h2 class="text-4xl text-future tracking-tighter mb-6">关于云基算力</h2>
          <p class="text-lg text-gray-700 max-w-3xl mx-auto">杭州民兰信息科技有限公司成立于2016年，浙大创新研究院背景，核心团队以浙大博硕士为主，已服务中国移动、中国电信、中国人保、中华保险等机构。我们致力于提供稳定、高性价比的国产大模型服务，让企业无需关注底层算力，直接聚焦业务创新。</p>
        </div>
      </section>

      <!-- Footer -->
      <footer class="dark-bg text-white py-16">
        <div class="max-w-6xl mx-auto px-6 text-center">
          <div class="flex justify-center items-center gap-3 mb-8">
            <div class="h-8 w-8 bg-gradient-to-br from-[#ef2cc1] to-[#fc4c02] rounded-lg flex items-center justify-center text-white font-bold">云</div>
            <span class="text-2xl font-medium text-future tracking-tighter">云基算力</span>
          </div>
          <div class="text-sm text-gray-400">© 2026 杭州民兰信息科技有限公司 浙ICP备20011256号</div>
        </div>
      </footer>

      <!-- 试用弹窗 -->
      <div id="trialModal" class="hidden fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4">
        <div class="bg-white max-w-md w-full mx-auto rounded-xl p-8 relative shadow-lg" style="background-color: #ffffff !important; opacity: 1 !important;">
          <button onclick="hideTrialModal()" class="absolute right-5 top-5 text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
          <h3 class="text-2xl font-bold mb-2 text-future">免费试用申请</h3>
          <p class="text-gray-500 text-sm mb-6">我们会尽快联系您，加客服qq27434328领免费额度</p>
          <div class="space-y-5">
            <input type="text" id="trialName" placeholder="姓名 *" class="w-full px-5 py-3 border border-gray-300 rounded-lg" style="background-color: #ffffff !important; opacity: 1 !important;">
            <input type="tel" id="trialPhone" placeholder="手机号 *" class="w-full px-5 py-3 border border-gray-300 rounded-lg" style="background-color: #ffffff !important; opacity: 1 !important;">
            <input type="email" id="trialEmail" placeholder="电子邮箱 *" class="w-full px-5 py-3 border border-gray-300 rounded-lg" style="background-color: #ffffff !important; opacity: 1 !important;">
            <textarea id="trialScenario" placeholder="使用场景（AI客服 / 自媒体 / 知识库等）" rows="3" class="w-full px-5 py-3 border border-gray-300 rounded-lg" style="background-color: #ffffff !important; opacity: 1 !important;"></textarea>
            <button id="submitTrialBtn" class="w-full py-4 bg-gradient-to-r from-[#ef2cc1] to-[#fc4c02] text-white font-semibold rounded-lg hover:shadow-lg">提交申请</button>
          </div>
        </div>
      </div>
    `;
    
    setHomePageContent(newHomeContent);
    localStorage.setItem('home_page_content', newHomeContent);
    
    // 检查用户是否登录，优先获取真实数据
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          // 用户已登录，获取真实数据
          fetchUserInfo().then();
        } else {
          // 用户未登录，使用本地存储或生成随机数据
          const storedKey = localStorage.getItem('openclaw_key');
          if (!storedKey) {
            const newKey = generateRandomKey();
            setGeneratedKey(newKey);
            localStorage.setItem('openclaw_key', newKey);
          } else {
            setGeneratedKey(storedKey);
          }
          
          // 生成邀请链接
          setInviteLink(generateInviteLink());
        }
      } catch (e) {
        console.error('解析用户信息失败:', e);
        // 解析失败，使用本地存储或生成随机数据
        const storedKey = localStorage.getItem('openclaw_key');
        if (!storedKey) {
          const newKey = generateRandomKey();
          setGeneratedKey(newKey);
          localStorage.setItem('openclaw_key', newKey);
        } else {
          setGeneratedKey(storedKey);
        }
        
        // 生成邀请链接
        setInviteLink(generateInviteLink());
      }
    } else {
      // 未登录，使用本地存储或生成随机数据
      const storedKey = localStorage.getItem('openclaw_key');
      if (!storedKey) {
        const newKey = generateRandomKey();
        setGeneratedKey(newKey);
        localStorage.setItem('openclaw_key', newKey);
      } else {
        setGeneratedKey(storedKey);
      }
      
      // 生成邀请链接
      setInviteLink(generateInviteLink());
    }
  }, []);

  // 添加一个useEffect钩子来定义弹窗相关函数
  useEffect(() => {
    // 定义showTrialModal函数
    window.showTrialModal = () => {
      const modal = document.getElementById('trialModal');
      if (modal) {
        modal.classList.remove('hidden');
      }
    };

    // 定义hideTrialModal函数
    window.hideTrialModal = () => {
      const modal = document.getElementById('trialModal');
      if (modal) {
        modal.classList.add('hidden');
      }
    };

    // 定义submitTrial函数
    window.submitTrial = async () => {
      const submitBtn = document.getElementById('submitTrialBtn');
      if (!submitBtn) return;

      const name = document.getElementById('trialName').value.trim();
      const phone = document.getElementById('trialPhone').value.trim();
      const email = document.getElementById('trialEmail').value.trim();
      const scenario = document.getElementById('trialScenario').value.trim() || '未填写';

      if (!name || !phone || !email) {
        console.log('请填写完整信息');
        return;
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        console.log('邮箱格式错误');
        return;
      }

      submitBtn.classList.add('btn-loading');
      submitBtn.innerText = '提交中...';

      try {
        const res = await fetch('http://yfs.bbs5050.com/note.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email, scenario, time: new Date().toLocaleString() })
        });

        const data = await res.json();
        if (data.success) {
          console.log('申请已提交，我们会尽快联系您！');
          window.hideTrialModal();
          ['trialName', 'trialPhone', 'trialEmail', 'trialScenario'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
          });
        } else {
          console.log('提交失败：' + (data.error || '未知错误'));
        }
      } catch (err) {
        console.log('网络错误，请稍后重试');
      } finally {
        submitBtn.classList.remove('btn-loading');
        submitBtn.innerText = '提交申请';
      }
    };

    // 为提交按钮添加点击事件监听器
    const submitBtn = document.getElementById('submitTrialBtn');
    if (submitBtn) {
      submitBtn.addEventListener('click', window.submitTrial);
    }

    // 清理函数
    return () => {
      if (submitBtn) {
        submitBtn.removeEventListener('click', window.submitTrial);
      }
    };
  }, [homePageContent]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEndpointIndex((prev) => (prev + 1) % endpointItems.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [endpointItems.length]);

  return (
    <div className="w-full overflow-x-hidden">
      <NoticeModal
        visible={noticeVisible}
        onClose={() => setNoticeVisible(false)}
        isMobile={isMobile}
      />
      {/* 固定导航栏 */}
      <header className="border-b border-black/10 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-gradient-to-br from-[#ef2cc1] to-[#fc4c02] rounded-lg flex items-center justify-center text-white font-bold text-xl">云</div>
            <span className="text-2xl font-semibold text-future tracking-tighter">云基算力</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a href="#models" className="hover:text-[#ef2cc1]">模型能力</a>
            <a href="#pricing" className="hover:text-[#ef2cc1]">价格套餐</a>
            <a href="#guarantee" className="hover:text-[#ef2cc1]">服务保障</a>
            <a href="#cases" className="hover:text-[#ef2cc1]">行业案例</a>
            <a href="#about" className="hover:text-[#ef2cc1]">关于我们</a>
            <a href="https://ai.bbs5050.com/doc/overview.html" className="hover:text-[#ef2cc1]" target="_blank">文档与工具</a>
          </nav>
          <div className="flex gap-4">
            <button onClick={() => window.showTrialModal()} className="px-6 py-2.5 text-sm font-medium border border-black/20 bg-gray-200 text-black hover:bg-gray-300 sharp">免费试用</button>
            <a href="/console" className="px-6 py-2.5 text-sm font-medium bg-[#010120] text-white sharp">登录控制台</a>
          </div>
        </div>
      </header>
      {homePageContentLoaded && homePageContent === '' ? (
        <div className="w-full overflow-x-hidden">
          {/* 背景效果 */}
          <div className="bg-effects">
            <div className="grid-lines"></div>
          </div>
          
          <div className="particles" id="particles"></div>

          {/* Hero 部分 */}
          <main className="relative z-10 pt-20 min-h-screen flex flex-col items-center justify-center">
            <div className="hero text-center max-w-4xl px-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-900 leading-tight mb-6">
                云基算力
              </h1>
              <p className="text-lg md:text-xl text-primary mb-4 font-semibold">
                云为基石，算力可信，安心至上
              </p>
              <p className="text-md md:text-lg text-gray-400 mb-8 tracking-wider">
                稳健筑基，数字安心，专业可信赖
              </p>
              
              {/* BASE URL 与端点选择 */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 w-full mt-6 max-w-md mx-auto">
                <Input
                  readonly
                  value={serverAddress}
                  className="flex-1 rounded-full"
                  size={isMobile ? 'default' : 'large'}
                  suffix={
                    <div className="flex items-center gap-2">
                      <ScrollList
                        bodyHeight={32}
                        style={{ border: 'unset', boxShadow: 'unset' }}
                      >
                        <ScrollItem
                          mode="wheel"
                          cycled={true}
                          list={endpointItems}
                          selectedIndex={endpointIndex}
                          onSelect={({ index }) => setEndpointIndex(index)}
                        />
                      </ScrollList>
                      <Button
                        type="primary"
                        onClick={handleCopyBaseURL}
                        icon={<IconCopy />}
                        className="rounded-full"
                      />
                    </div>
                  }
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-row gap-4 justify-center items-center mt-8">
                <Link to="/console">
                  <Button
                    theme="solid"
                    type="primary"
                    size={isMobile ? 'default' : 'large'}
                    className="rounded-3xl px-8 py-2"
                    icon={<IconPlay />}
                  >
                    {t('获取密钥')}
                  </Button>
                </Link>
                {isDemoSiteMode && statusState?.status?.version ? (
                  <Button
                    size={isMobile ? 'default' : 'large'}
                    className="flex items-center rounded-3xl px-6 py-2"
                    icon={<IconGithubLogo />}
                    onClick={() =>
                      window.open(
                        'https://github.com/QuantumNous/new-api',
                        '_blank'
                      )
                    }
                  >
                    {statusState.status.version}
                  </Button>
                ) : (
                  docsLink && (
                    <Button
                      size={isMobile ? 'default' : 'large'}
                      className="flex items-center rounded-3xl px-6 py-2"
                      icon={<IconFile />}
                      onClick={() => window.open(docsLink, '_blank')}
                    >
                      {t('文档')}
                    </Button>
                  )
                )}
              </div>
            </div>

            {/* 品牌简介 */}
            <div className="max-w-6xl w-full px-4 mt-20">
              <Card className="with-pastel-balls">
                <div className="p-6">
                  <h2 className="text-3xl font-700 mb-6 text-primary">关于云基算力</h2>
                  <p className="text-lg mb-8">
                    云基算力，是专注数字服务与权益流通的合规服务平台，秉持安全、透明、稳健的运营理念，依托硬核技术实力与专业科研背景，构建高标准、高安全、高公信力的服务体系。平台以基础设施级稳定架构，打造便捷、可靠、放心的使用环境，坚守合规底线，保障用户权益，做全民信赖的数字服务平台。
                  </p>
                </div>
              </Card>
            </div>

            {/* 为什么选择云基算力 */}
            <div className="max-w-6xl w-full px-4 mt-20">
              <Card className="with-pastel-balls">
                <div className="p-6">
                  <h2 className="text-3xl font-700 mb-8 text-primary">为什么选择云基算力？</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🏛️ 科研背书
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>依托浙江大学计算机创新研究院</li>
                        <li>专业团队研发，品质有保障</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🔒 超算级安全
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>对标国家超算安全标准</li>
                        <li>多重加密，保障资产安全</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📜 合规透明
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>坚守合规底线，流程公开透明</li>
                        <li>无隐形消费，放心选购</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🎯 优质Token
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>严格筛选，品质过关</li>
                        <li>稳定可靠，性价比优选</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 限时专属优惠 */}
            <div className="max-w-6xl w-full px-4 mt-20">
              <Card className="with-pastel-balls bg-gradient-to-r from-blue-900 to-purple-900">
                <div className="p-6">
                  <h2 className="text-3xl font-700 mb-6 text-white">限时专属优惠</h2>
                  <p className="text-xl mb-8 text-yellow-300 font-semibold">错过再等一年！手慢无！</p>
                  <div className="space-y-4">
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-white">活动1：注册送Token</h3>
                      <p className="text-sm text-gray-200">新用户注册即送1000万Token，一周内有效！</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-white">活动2：充值优惠</h3>
                      <p className="text-sm text-gray-200">充的多送的多，换算后比其他平台便宜一半，贵就赔！</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-white">活动3：邀请有礼</h3>
                      <p className="text-sm text-gray-200">邀请好友注册送100万Token，佣金10%！</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mt-6">活动时间：2026年3月20日 - 2026年5月1日 | 最终解释权归云基算力所有</p>
                </div>
              </Card>
            </div>

            {/* 代理销售 */}
            <div className="max-w-6xl w-full px-4 mt-20">
              <Card className="with-pastel-balls">
                <div className="p-6">
                  <h2 className="text-3xl font-700 mb-8 text-primary">代理销售 · 共赢未来</h2>
                  <p className="text-lg mb-8">零门槛、高佣金、强支持，诚邀各界合作伙伴，携手共创收益</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🚪 零门槛代理
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>无需押金、无需经验</li>
                        <li>个人/企业均可申请，轻松起步</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        💰 高佣金回报
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>佣金比例高达15%-30%</li>
                        <li>销量越高，佣金越高，上不封顶</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🤝 全方位支持
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>提供宣传物料、专属客服</li>
                        <li>实时结算，售后无忧</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 mt-8">
                    <Link to="/console/agent">
                      <Button
                        theme="solid"
                        type="primary"
                        size="large"
                        className="rounded-3xl px-8 py-2"
                      >
                        立即申请代理
                      </Button>
                    </Link>
                    <Link to="/console/agent">
                      <Button
                        theme="borderless"
                        type="primary"
                        size="large"
                        className="rounded-3xl px-8 py-2"
                      >
                        查看代理详情
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </div>

            {/* 安全保障 */}
            <div className="max-w-6xl w-full px-4 mt-20">
              <Card className="with-pastel-balls">
                <div className="p-6">
                  <h2 className="text-3xl font-700 mb-8 text-primary">安全保障 · 放心托付</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        🔐 技术加密
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>银行级加密技术</li>
                        <li>保障交易安全</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📜 合规运营
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>资质齐全，合规备案</li>
                        <li>全程透明可追溯</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        👁️ 实时监控
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>24小时实时监控</li>
                        <li>及时防范风险</li>
                      </ul>
                    </div>
                    <div className="bg-gray-900 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        📞 专属客服
                      </h3>
                      <ul className="list-disc list-inside text-sm space-y-2 text-gray-300">
                        <li>7×24小时在线</li>
                        <li>及时响应需求</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 优质Token产品 */}
            <div className="products grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full px-4 mt-20">
              <div className="product-card">
                <span className="product-icon">⭐</span>
                <h3 className="text-22 mb-4">基础版Token</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  入门优选 · 稳定可靠
                </p>
                <a href="/console" className="btn inline-block mt-4">立即购买</a>
              </div>

              <div className="product-card">
                <span className="product-icon">🌟</span>
                <h3 className="text-22 mb-4">进阶版Token</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  高性价比 · 权益升级
                </p>
                <a href="/console" className="btn inline-block mt-4">立即购买</a>
              </div>

              <div className="product-card">
                <span className="product-icon">💎</span>
                <h3 className="text-22 mb-4">旗舰版Token</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  顶级配置 · 专属权益
                </p>
                <a href="/console" className="btn inline-block mt-4">立即购买</a>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link to="/console">
                <Button
                  theme="borderless"
                  type="primary"
                  size="large"
                  className="rounded-3xl px-8 py-2"
                >
                  查看全部产品
                </Button>
              </Link>
            </div>
          </main>
        </div>
      ) :
        <div className="overflow-x-hidden w-full">
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              className="w-full h-screen border-none"
            />
          ) : (
            <div
              className="mt-[10px]"
              dangerouslySetInnerHTML={{ __html: homePageContent.replace(/<header[\s\S]*?<\/header>/, '') }}
            />
          )}
        </div>
      }
    </div>
  );
};

export default Home;