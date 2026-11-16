/**
 * Host half of @local/onebot-panel —— 「个人号接入」独立插件包。
 *
 * 只做一件事：往 AI记忆（companion-memory）的数据目录写一份接入清单
 *   {AI记忆数据目录}/integrations/onebot-panel.json
 * 这样它会出现在「接入软件 → 已安装 → 外部软件」里；设置面板由 AI记忆 承载
 * （statusUrl / enabledUrl 直接复用 AI记忆 的接口）。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const ID = 'onebot-panel'
const VERSION = '0.2.0'

function companionDataDir() {
  const home = process.env.DSH_HOME && String(process.env.DSH_HOME).trim() !== ''
    ? String(process.env.DSH_HOME).trim()
    : join(homedir(), '.dsh')
  return join(home, 'companion-memory')
}

function manifest() {
  return {
    id: ID,
    name: '个人号接入',
    description: '用 NapCat 协议端登录 QQ 小号；一键安装配置、面板扫码、更换 QQ 号，可与官方机器人同时开启。',
    version: VERSION,
    author: 'Root-7-KHX',
    category: '应用',
    tags: ['QQ', 'OneBot', 'NapCat', '个人号'],
    capabilities: ['个人号接入', '扫码登录', '更换 QQ 号', '双通道'],
    app: ID,
    plugin: '@local/onebot-panel',
    openable: true,
    statusUrl: '/companion/api/qq/status',
    enabledUrl: '/companion/api/qq/enabled',
    hint: '点「打开」进入个人号面板：自动配置、二维码、更换 QQ 号、双通道开关。',
  }
}

export function apply(ctx) {
  ctx.effect(() => {
    try {
      const dir = join(companionDataDir(), 'integrations')
      if (existsSync(dir)) {
        const file = join(dir, ID + '.json')
        const text = JSON.stringify(manifest(), null, 2) + '\n'
        let current = ''
        try { current = readFileSync(file, 'utf8').replace(/^\uFEFF/, '') } catch { /* ignore */ }
        if (current !== text) writeFileSync(file, text, 'utf8')
      }
    } catch { /* 清单写失败不影响插件加载 */ }
    return () => {}
  }, 'onebot-panel: register integration manifest')
}

