import { useOne, useShow } from "@refinedev/core";

import { ShowView } from "@/components/refine-ui/views/show-view";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const BlogPostShow = () => {
  const { result: record, query } = useShow({});

  const {
    result: category,
    query: { isLoading: categoryIsLoading },
  } = useOne({
    resource: "categories",
    id: record?.category?.id || "",
    queryOptions: {
      enabled: !!record,
    },
  });
  const { isLoading } = query;

  return (
    <ShowView>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{record?.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-4">
                <Badge
                  variant={
                    record?.status === "published" ? "default" : "secondary"
                  }
                >
                  {record?.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ID: {record?.id}
                </span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Category</h4>
              <p className="text-sm text-muted-foreground">
                {categoryIsLoading ? "Loading..." : category?.title || "-"}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-2">Created At</h4>
              <p className="text-sm text-muted-foreground">
                {record?.createdAt
                  ? new Date(record.createdAt).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-medium mb-4">Content</h4>
              <div className="prose prose-sm max-w-none">
                {record?.content ? (
                  <div dangerouslySetInnerHTML={{ __html: record.content }} />
                ) : (
                  <p className="text-muted-foreground">No content available</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ShowView>
  );
};
