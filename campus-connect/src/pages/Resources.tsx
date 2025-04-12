
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Link, Download, Upload } from "lucide-react";

const Resources = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Resources</h1>
        <p className="text-muted-foreground">
          Academic resources and materials
        </p>
      </div>
      
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="links" className="gap-2">
            <Link className="h-4 w-4" />
            Important Links
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Documents</CardTitle>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-12">
                No documents have been uploaded yet
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="links">
          <Card>
            <CardHeader>
              <CardTitle>Important Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">College Website</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Official website of the college with all information
                  </p>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Link className="h-4 w-4" />
                    Visit
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">Student Portal</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Portal for student services, grades, and course registration
                  </p>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Link className="h-4 w-4" />
                    Visit
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium">Library Resources</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Access to online journals, books, and research materials
                  </p>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Link className="h-4 w-4" />
                    Visit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
