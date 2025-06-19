import jsPDF from 'jspdf';

interface ClientInfo {
  company: {
    uuid: string;
    name: string;
    subdomain: string;
    contactName: string;
    contactEmail: string;
    status: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    trialEndsAt?: string;
    createdAt: string;
  };
  statistics: {
    users: { total: number };
    posts: { total: number; published: number; draft: number; archived: number };
    media: { total: number };
    taxonomy: { categories: number; tags: number };
  };
  recentActivity: {
    recentPosts: Array<{
      id: string;
      title: string;
      status: string;
      createdAt?: string;
    }>;
  };
  apiInfo: {
    baseUrl: string;
    authentication: {
      method: string;
      description: string;
      header: string;
      apiKey: string;
      usage: string;
      note: string;
    };
    endpoints: {
      posts: {
        list: string;
        getBySlug: string;
        getByCategory: string;
        getByTag: string;
      };
    };
    exampleRequests: {
      getAllPosts: {
        url: string;
        headers: any;
        queryParameters: any;
      };
      getPostBySlug: {
        url: string;
        headers: any;
      };
      getPostsByCategory: {
        url: string;
        headers: any;
        queryParameters: any;
      };
      getPostsByTag: {
        url: string;
        headers: any;
        queryParameters: any;
      };
    };
    responseFormats: any;
    commonParameters: any;
  };
}

export class PDFService {
  static generateClientReport(clientInfo: ClientInfo): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;
    const leftMargin = 20;
    const rightMargin = 20;
    const contentWidth = pageWidth - leftMargin - rightMargin;
    let currentPageNumber = 1;
    let totalPagesCount = 1;

    // Helper function to add new page if needed
    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - 20) {
        doc.addPage();
        totalPagesCount++;
        currentPageNumber++;
        yPosition = 20;
      }
    };

    // Header with logo background
    doc.setFillColor(59, 130, 246); // Blue background
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT INFORMATION REPORT', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 32, { align: 'center' });
    
    yPosition = 50;

    // Company Information Section
    this.addCompanySection(doc, clientInfo, leftMargin, contentWidth, yPosition, checkPageBreak);
    yPosition += this.getCompanySectionHeight(clientInfo);

    // Statistics Section
    this.addStatisticsSection(doc, clientInfo, leftMargin, contentWidth, yPosition, checkPageBreak);
    yPosition += this.getStatisticsSectionHeight();

    // API Information Section
    this.addAPISection(doc, clientInfo, leftMargin, contentWidth, yPosition, checkPageBreak);
    yPosition += this.getAPISectionHeight(clientInfo);

    // Recent Posts Section (only if there are posts)
    if (clientInfo.recentActivity?.recentPosts && clientInfo.recentActivity.recentPosts.length > 0) {
      this.addRecentPostsSection(doc, clientInfo, leftMargin, contentWidth, yPosition, checkPageBreak);
    }

    // Add page numbers to all pages
    this.addPageNumbers(doc, totalPagesCount, clientInfo.company.name, pageWidth, pageHeight, leftMargin);

    // Save the PDF
    const filename = `${clientInfo.company.name.replace(/[^a-zA-Z0-9]/g, '_')}_API_Documentation.pdf`;
    doc.save(filename);
  }

  private static addCompanySection(
    doc: jsPDF, 
    clientInfo: ClientInfo, 
    leftMargin: number, 
    contentWidth: number, 
    yPos: number, 
    checkPageBreak: (space: number) => void
  ): void {
    checkPageBreak(80);
    
    doc.setFillColor(239, 246, 255); // Light blue background
    doc.rect(leftMargin - 5, yPos - 5, contentWidth + 10, 8, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPANY INFORMATION', leftMargin, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const companyData = [
      ['Company Name:', clientInfo.company.name],
      ['Contact Person:', clientInfo.company.contactName],
      ['Contact Email:', clientInfo.company.contactEmail],
      ['Subdomain:', clientInfo.company.subdomain],
      ['Account Status:', clientInfo.company.status],
      ['Subscription Plan:', clientInfo.company.subscriptionPlan],
      ['Subscription Status:', clientInfo.company.subscriptionStatus],
      ['Client UUID:', clientInfo.company.uuid],
      ['Member Since:', new Date(clientInfo.company.createdAt || Date.now()).toLocaleDateString()]
    ];

    companyData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, leftMargin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(value, leftMargin + 40, yPos);
      yPos += 7;
    });
  }

  private static addStatisticsSection(
    doc: jsPDF, 
    clientInfo: ClientInfo, 
    leftMargin: number, 
    contentWidth: number, 
    yPos: number, 
    checkPageBreak: (space: number) => void
  ): void {
    checkPageBreak(60);

    doc.setFillColor(236, 253, 245); // Light green background
    doc.rect(leftMargin - 5, yPos - 5, contentWidth + 10, 8, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTENT STATISTICS', leftMargin, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    const statsData = [
      ['Total Users:', clientInfo.statistics.users.total.toString()],
      ['Total Posts:', clientInfo.statistics.posts.total.toString()],
      ['Published Posts:', clientInfo.statistics.posts.published.toString()],
      ['Draft Posts:', clientInfo.statistics.posts.draft.toString()],
      ['Archived Posts:', clientInfo.statistics.posts.archived.toString()],
      ['Media Files:', clientInfo.statistics.media.total.toString()],
      ['Categories:', clientInfo.statistics.taxonomy.categories.toString()],
      ['Tags:', clientInfo.statistics.taxonomy.tags.toString()]
    ];

    // Create a two-column layout for statistics
    statsData.forEach(([label, value], index) => {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const xPos = leftMargin + (column * (contentWidth / 2));
      const yPosition = yPos + (row * 7);
      
      doc.setFont('helvetica', 'bold');
      doc.text(label, xPos, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(value, xPos + 35, yPosition);
    });
  }

  private static addAPISection(
    doc: jsPDF, 
    clientInfo: ClientInfo, 
    leftMargin: number, 
    contentWidth: number, 
    yPos: number, 
    checkPageBreak: (space: number) => void
  ): void {
    checkPageBreak(200);

    doc.setFillColor(252, 231, 243); // Light purple background
    doc.rect(leftMargin - 5, yPos - 5, contentWidth + 10, 8, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(147, 51, 234);
    doc.setFont('helvetica', 'bold');
    doc.text('API DOCUMENTATION', leftMargin, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    const apiData = [
      ['Base URL:', clientInfo.apiInfo.baseUrl],
      ['Authentication Method:', clientInfo.apiInfo.authentication.method],
      ['API Key Header:', clientInfo.apiInfo.authentication.header],
      ['API Key:', clientInfo.apiInfo.authentication.apiKey]
    ];

    apiData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, leftMargin, yPos);
      doc.setFont('helvetica', 'normal');
      // Handle long URLs by wrapping text
      if (value.length > 50) {
        const splitText = doc.splitTextToSize(value, contentWidth - 45);
        doc.text(splitText, leftMargin + 45, yPos);
        yPos += splitText.length * 5;
      } else {
        doc.text(value, leftMargin + 45, yPos);
        yPos += 7;
      }
    });

    yPos += 10;

    // API Endpoints Section
    doc.setFontSize(14);
    doc.setTextColor(147, 51, 234);
    doc.setFont('helvetica', 'bold');
    doc.text('Available Endpoints:', leftMargin, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    const endpoints = [
      ['GET /posts', 'Get all posts with pagination and filters'],
      ['GET /posts/slug/{slug}', 'Get a specific post by slug'],
      ['GET /posts/category/{categorySlug}', 'Get posts by category'],
      ['GET /posts/tag/{tagSlug}', 'Get posts by tag']
    ];

    endpoints.forEach(([endpoint, description]) => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(endpoint, leftMargin, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(description, leftMargin, yPos + 4);
      yPos += 12;
    });

    // Example Requests Section
    yPos += 5;
    doc.setFontSize(14);
    doc.setTextColor(147, 51, 234);
    doc.setFont('helvetica', 'bold');
    doc.text('Example API Requests:', leftMargin, yPos);
    yPos += 10;

    doc.setFontSize(9);
    doc.setFont('courier', 'normal');

    const examples = [
      {
        title: 'Get All Posts:',
        code: `curl -X GET "${clientInfo.apiInfo.exampleRequests.getAllPosts.url}" \\
-H "x-api-key: ${clientInfo.apiInfo.authentication.apiKey}" \\
-G -d "page=1&limit=10&status=published"`
      },
      {
        title: 'Get Post by Slug:',
        code: `curl -X GET "${clientInfo.apiInfo.baseUrl}/posts/slug/your-post-slug" \\
-H "x-api-key: ${clientInfo.apiInfo.authentication.apiKey}"`
      }
    ];

    examples.forEach(({ title, code }) => {
      checkPageBreak(25);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(title, leftMargin, yPos);
      yPos += 6;
      
      doc.setFont('courier', 'normal');
      doc.setTextColor(51, 51, 51);
      const codeLines = doc.splitTextToSize(code, contentWidth - 5);
      doc.text(codeLines, leftMargin + 2, yPos);
      yPos += codeLines.length * 4 + 8;
    });
  }

  private static addRecentPostsSection(
    doc: jsPDF, 
    clientInfo: ClientInfo, 
    leftMargin: number, 
    contentWidth: number, 
    yPos: number, 
    checkPageBreak: (space: number) => void
  ): void {
    checkPageBreak(50);
    
    doc.setFillColor(254, 243, 199); // Light yellow background
    doc.rect(leftMargin - 5, yPos - 5, contentWidth + 10, 8, 'F');
    
    doc.setFontSize(18);
    doc.setTextColor(217, 119, 6);
    doc.setFont('helvetica', 'bold');
    doc.text('RECENT POSTS', leftMargin, yPos);
    yPos += 15;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    clientInfo.recentActivity.recentPosts.forEach((post, index) => {
      checkPageBreak(12);
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. `, leftMargin, yPos);
      
      doc.setFont('helvetica', 'normal');
      const title = doc.splitTextToSize(post.title, contentWidth - 15);
      doc.text(title, leftMargin + 8, yPos);
      
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(102, 102, 102);
      doc.text(`(${post.status})`, leftMargin + 8 + doc.getTextWidth(title[0]) + 5, yPos);
      
      yPos += title.length * 5 + 3;
      doc.setTextColor(0, 0, 0);
    });
  }

  private static addPageNumbers(
    doc: jsPDF, 
    totalPages: number, 
    companyName: string, 
    pageWidth: number, 
    pageHeight: number, 
    leftMargin: number
  ): void {
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(102, 102, 102);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, pageHeight - 10);
      doc.text(`Generated for ${companyName}`, leftMargin, pageHeight - 10);
    }
  }

  private static getCompanySectionHeight(clientInfo: ClientInfo): number {
    return 80; // Approximate height for company section
  }

  private static getStatisticsSectionHeight(): number {
    return 60; // Approximate height for statistics section
  }

  private static getAPISectionHeight(clientInfo: ClientInfo): number {
    return 200; // Approximate height for API section
  }
}