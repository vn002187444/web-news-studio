import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'cb3cdnq7',
    dataset: 'production'
  },
  studioHost: 'web-news-studio-vn',
  deployment: {
    appId: 'fdeisdb307z20bh37pbhw7hg',
    autoUpdates: true,
  },
})
