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
    const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : 'guest';
    return `${window.location.origin}?aff=${userId}`;
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
    displayHomePageContent().then();
    
    // 检查本地存储是否已有密钥，如果没有则生成新的
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
  }, []);

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
                智能算力
                <span className="block text-3xl md:text-4xl mt-4">触手可及</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-8 tracking-wider">
                {t('企业级 AI API Token | 高性能 GPU 算力 | 专业模型微调服务')}
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

            {/* OpenClaw 龙虾快捷使用指南 */}
            <div className="max-w-6xl w-full px-4 mt-20">
              <Card className="with-pastel-balls">
                <div className="p-6">
                  <h2 className="text-3xl font-700 mb-6 text-primary">OpenClaw 龙虾快捷使用指南</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-600 mb-4 flex items-center gap-2">
                        <IconKey />
                        快速配置
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">API 地址</label>
                          <div className="flex gap-2">
                            <Input
                              value={openclawUrl}
                              onChange={setOpenclawUrl}
                              className="flex-1"
                            />
                            <Button
                              type="primary"
                              onClick={() => copy(openclawUrl).then(() => showSuccess('已复制地址到剪切板'))}
                              icon={<IconCopy />}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">密钥令牌</label>
                          <div className="flex gap-2">
                            <Input
                              value={generatedKey}
                              readOnly
                              className="flex-1"
                            />
                            <Button
                              type="primary"
                              onClick={handleCopyKey}
                              icon={<IconCopy />}
                            />
                            <Button
                              onClick={regenerateKey}
                              icon={<IconKey />}
                            />
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">
                          输入以上 API 地址和密钥，即可快速使用 OpenClaw 龙虾服务。
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-600 mb-4 flex items-center gap-2">
                        <IconGift />
                        邀请奖励
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">邀请链接</label>
                          <div className="flex gap-2">
                            <Input
                              value={inviteLink}
                              readOnly
                              className="flex-1"
                            />
                            <Button
                              type="primary"
                              onClick={handleCopyInviteLink}
                              icon={<IconCopy />}
                            />
                          </div>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-lg">
                          <h4 className="font-600 mb-2">邀请奖励规则</h4>
                          <ul className="list-disc list-inside text-sm space-y-2">
                            <li>邀请新用户注册并使用服务</li>
                            <li>双方均可获得 10% 的收益奖励</li>
                            <li>奖励自动发放到账户余额</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* 产品卡片 */}
            <div className="products grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full px-4 mt-20">
              <div className="product-card">
                <span className="product-icon">🔥</span>
                <h3 className="text-22 mb-4">GPT-4o Token</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  {t('OpenAI 最新模型，支持多模态，理解能力更强，响应更快')}
                </p>
                <div className="price text-28 text-accent mb-2">¥1.5<span className="text-14 text-gray-400">/K tokens</span></div>
                <a href="/console" className="btn inline-block mt-4">{t('立即购买')}</a>
              </div>

              <div className="product-card">
                <span className="product-icon">💎</span>
                <h3 className="text-22 mb-4">Claude 3.5 Token</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  {t('Anthropic 出品，长文本处理专家，适合复杂推理与代码生成')}
                </p>
                <div className="price text-28 text-accent mb-2">¥2.0<span className="text-14 text-gray-400">/K tokens</span></div>
                <a href="/console" className="btn inline-block mt-4">{t('立即购买')}</a>
              </div>

              <div className="product-card">
                <span className="product-icon">⚡</span>
                <h3 className="text-22 mb-4">Gemini Pro Token</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  {t('Google 多模态大模型，超大上下文窗口，性价比之选')}
                </p>
                <div className="price text-28 text-accent mb-2">¥0.8<span className="text-14 text-gray-400">/K tokens</span></div>
                <a href="/console" className="btn inline-block mt-4">{t('立即购买')}</a>
              </div>

              <div className="product-card">
                <span className="product-icon">🐲</span>
                <h3 className="text-22 mb-4">智谱 GLM-4 Token</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  {t('国产大模型，性价比高，中文理解能力强，支持微调')}
                </p>
                <div className="price text-28 text-accent mb-2">¥0.3<span className="text-14 text-gray-400">/K tokens</span></div>
                <a href="/console" className="btn inline-block mt-4">{t('立即购买')}</a>
              </div>

              <div className="product-card">
                <span className="product-icon">🎨</span>
                <h3 className="text-22 mb-4">Midjourney API</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  {t('AI 图像生成，支持 V6 版本，文字渲染能力大幅提升')}
                </p>
                <div className="price text-28 text-accent mb-2">¥3.0<span className="text-14 text-gray-400">/张</span></div>
                <a href="/console" className="btn inline-block mt-4">{t('立即购买')}</a>
              </div>

              <div className="product-card">
                <span className="product-icon">🔊</span>
                <h3 className="text-22 mb-4">TTS 语音合成</h3>
                <p className="desc text-14 text-gray-400 mb-6 leading-relaxed">
                  {t('高质量语音输出，支持多种音色，适合有声内容创作')}
                </p>
                <div className="price text-28 text-accent mb-2">¥0.1<span className="text-14 text-gray-400">/千字符</span></div>
                <a href="/console" className="btn inline-block mt-4">{t('立即购买')}</a>
              </div>
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
              className="mt-[60px]"
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            />
          )}
        </div>
      }
    </div>
  );
};

export default Home;