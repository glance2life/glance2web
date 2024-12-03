import { useEffect, useState } from "react"

export function useActivatedTabUrl(): string {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    chrome.tabs.query({ active: true }).then((tabs) => {
      if (tabs.length) {
        setUrl(tabs[0].url)
      }
    })
  }, [])

  useEffect(() => {
    const activeHandler = async (activeInfo) => {
      try {
        const tab = await chrome.tabs.get(activeInfo.tabId)
        setUrl(tab.url)
      } catch (error) {
        console.error("Error fetching active tab:", error)
      }
    }

    const updateHandler = (tabId, changeInfo, tab) => {
      if (tab.active && changeInfo.url) {
        setUrl(changeInfo.url)
      }
    }

    chrome.tabs.onActivated.addListener(activeHandler)
    chrome.tabs.onUpdated.addListener(updateHandler)

    return () => {
      chrome.tabs.onActivated.removeListener(activeHandler)
      chrome.tabs.onUpdated.removeListener(updateHandler)
    }
  }, [])

  return url
}
