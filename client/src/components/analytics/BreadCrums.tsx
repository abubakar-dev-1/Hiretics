import {
    Breadcrumb,
    BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb"
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  
  export function BreadcrumbDemo() {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-[#16A34A] underline">All Campagins</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-[#16A34A]" />
     
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-[#16A34A] underline">Campaign</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-[#16A34A]" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[#16A34A] underline ">Analytics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }
  