"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  Building2,
  CloudUpload,
  X,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useEffect, useState, useRef, useCallback } from "react"
import { getPublicCampaign } from "@/api/campaign/api"
import { Campaign } from "@/types/campaign"
import { uploadCV } from "@/api/cv/api"
import { toast } from "sonner"

interface ApplicantsProps {
  title?: string
  description?: string
  companyName?: string
  companyAvatar?: string
  id?: string
}

type UploadState = "idle" | "dragging" | "selected" | "uploading" | "success" | "error"

export default function Applicants({ id }: ApplicantsProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [fileName, setFileName] = useState("")
  const [fileSize, setFileSize] = useState("")
  const [progress, setProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const isCampaignEnded = campaign?.status === "ended" || campaign?.status === "completed"

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOC, or DOCX file.")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB.")
      return
    }
    setFileName(file.name)
    setFileSize(formatFileSize(file.size))
    setSelectedFile(file)
    setUploadState("selected")
  }, [])

  const handleUpload = async () => {
    if (!selectedFile || !campaign?.id) return
    setUploadState("uploading")
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) { clearInterval(interval); return 90 }
        return prev + Math.random() * 15
      })
    }, 300)

    try {
      await uploadCV({ campaignId: campaign.id, file: selectedFile })
      clearInterval(interval)
      setProgress(100)
      setTimeout(() => setUploadState("success"), 400)
      toast.success("Your CV has been submitted successfully!")
    } catch {
      clearInterval(interval)
      setProgress(0)
      setUploadState("error")
      toast.error("Failed to upload CV. Please try again.")
    }
  }

  const handleReset = () => {
    setUploadState("idle")
    setFileName("")
    setFileSize("")
    setSelectedFile(null)
    setProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setUploadState((prev) => (prev === "idle" ? "dragging" : prev))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setUploadState((prev) => (prev === "dragging" ? "idle" : prev))
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const file = e.dataTransfer.files?.[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  useEffect(() => {
    if (id) {
      setLoading(true)
      getPublicCampaign(id)
        .then(setCampaign)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id])

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Not found
  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            This campaign doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  const deadline = formatDate(campaign.end_date)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Minimal header */}
      <header className="shrink-0 px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-[#16A34A] flex items-center justify-center">
            <span className="text-white font-bold text-xs">H</span>
          </div>
          <span className="text-sm font-semibold text-foreground/70">Hiretics</span>
        </div>
      </header>

      {/* Center content vertically */}
      <main className="flex-1 flex items-start md:items-center justify-center px-6 pb-12 pt-4 md:pt-0">
        <div className="w-full max-w-xl">

          {/* Company + Role */}
          <div className="text-center mb-10">
            <Avatar className="h-14 w-14 mx-auto mb-5 border-2 border-border/50 shadow-sm">
              <AvatarImage src="/placeholder.svg" alt={campaign.company_name} />
              <AvatarFallback className="bg-[#16A34A]/10 text-[#16A34A] font-bold text-lg">
                {campaign.company_name?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <p className="text-sm text-muted-foreground mb-2">
              {campaign.company_name}
            </p>

            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {campaign.job_role}
            </h1>

            {deadline && !isCampaignEnded && (
              <p className="text-xs text-muted-foreground/60 mt-3">
                Apply by {deadline}
              </p>
            )}

            {isCampaignEnded && (
              <div className="inline-flex items-center gap-1.5 mt-3 text-xs text-red-500/80">
                <Clock className="w-3 h-3" />
                Applications closed
              </div>
            )}
          </div>

          {/* Upload zone — the main focus */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
          />

          {isCampaignEnded ? (
            <div className="rounded-2xl border border-border/50 bg-muted/20 p-12 text-center">
              <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                This position is no longer accepting applications.
              </p>
            </div>
          ) : uploadState === "success" ? (
            <div className="rounded-2xl border border-[#16A34A]/20 bg-[#16A34A]/[0.03] p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#16A34A]/10 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-[#16A34A]" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Application submitted
              </h2>
              <p className="text-sm text-muted-foreground mb-1">
                Your CV is being analyzed by our AI.
              </p>
              <p className="text-xs text-muted-foreground/50 mb-6">
                {fileName} &middot; {fileSize}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-muted-foreground"
              >
                Upload a different CV
              </Button>
            </div>
          ) : uploadState === "uploading" ? (
            <div className="rounded-2xl border border-border/50 bg-card p-12 text-center">
              <Loader2 className="w-8 h-8 text-[#16A34A] animate-spin mx-auto mb-5" />
              <p className="text-sm font-medium text-foreground mb-1">
                Analyzing your CV...
              </p>
              <p className="text-xs text-muted-foreground mb-6">{fileName}</p>
              <div className="max-w-[200px] mx-auto">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#16A34A] rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ) : uploadState === "selected" ? (
            <div className="rounded-2xl border border-border/50 bg-card p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#16A34A]/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-[#16A34A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">{fileSize}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  className="flex-1 bg-[#16A34A] hover:bg-[#15803D] text-white h-11 rounded-xl gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Submit Application
                </Button>
                <Button
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={() => {
                    handleReset()
                    fileInputRef.current?.click()
                  }}
                >
                  Change
                </Button>
              </div>
            </div>
          ) : uploadState === "error" ? (
            <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-12 text-center">
              <AlertCircle className="w-8 h-8 text-red-500/60 mx-auto mb-4" />
              <p className="text-sm font-medium text-foreground mb-1">
                Upload failed
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Something went wrong. Please try again.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleUpload}
                  size="sm"
                  className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl"
                >
                  Retry
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Choose different file
                </Button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`group rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200 ${
                uploadState === "dragging"
                  ? "border-[#16A34A]/50 bg-[#16A34A]/[0.03]"
                  : "border-border/40 hover:border-border/80 bg-transparent"
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5 transition-all ${
                uploadState === "dragging"
                  ? "bg-[#16A34A]/10"
                  : "bg-muted/60 group-hover:bg-muted"
              }`}>
                <CloudUpload className={`w-6 h-6 transition-colors ${
                  uploadState === "dragging"
                    ? "text-[#16A34A]"
                    : "text-muted-foreground/60 group-hover:text-muted-foreground"
                }`} />
              </div>

              <p className="text-sm text-foreground mb-1">
                {uploadState === "dragging" ? "Drop your CV here" : "Drop your CV here or"}
                {uploadState !== "dragging" && (
                  <span className="text-[#16A34A] font-medium"> browse</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground/50">
                PDF, DOC, DOCX &middot; Max 10MB
              </p>
            </div>
          )}

          {/* Job details — collapsible, secondary */}
          {campaign.job_description && (
            <div className="mt-8">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-2"
              >
                {showDetails ? "Hide" : "View"} job details
                {showDetails ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>

              {showDetails && (
                <div className="mt-3 rounded-xl border border-border/30 bg-card/50 p-6 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div>
                    <p className="text-xs font-medium text-foreground/70 mb-2 uppercase tracking-wider">
                      About the role
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {campaign.job_description}
                    </p>
                  </div>

                  {campaign.company_name && (
                    <div className="flex items-center gap-3 pt-3 border-t border-border/30">
                      <Building2 className="w-4 h-4 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground">
                        {campaign.company_name}
                      </span>
                    </div>
                  )}

                  {campaign.criteria?.required_skills && campaign.criteria.required_skills.length > 0 && (
                    <div className="pt-3 border-t border-border/30">
                      <p className="text-xs font-medium text-foreground/70 mb-2 uppercase tracking-wider">
                        Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {campaign.criteria.required_skills.map((skill, i) => (
                          <span
                            key={i}
                            className="text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-[11px] text-muted-foreground/30 mt-10">
            By applying you agree to our Terms &amp; Privacy Policy
          </p>
        </div>
      </main>
    </div>
  )
}
