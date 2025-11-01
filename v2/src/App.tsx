import { GitHubBanner, Refine } from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from '@refinedev/devtools';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';

import routerProvider, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router';
import dataProvider from '@refinedev/simple-rest';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router';
import './App.css';
import { ErrorComponent } from './components/refine-ui/layout/error-component';
import { Layout } from './components/refine-ui/layout/layout';
import { Toaster } from './components/refine-ui/notification/toaster';
import { useNotificationProvider } from './components/refine-ui/notification/use-notification-provider';
import { ThemeProvider } from './components/refine-ui/theme/theme-provider';
import { BlogPostCreate, BlogPostEdit, BlogPostList, BlogPostShow } from './pages/blog-posts';
import { CategoryCreate, CategoryEdit, CategoryList, CategoryShow } from './pages/categories';
import { useRef } from 'react';

function App() {
  const pathname = location.pathname;
  const first = useRef(pathname.substring(0, pathname.indexOf('/v2') + 3));

  return (
    <BrowserRouter basename={first.current}>
      <GitHubBanner />
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider('https://api.fake-rest.refine.dev')}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              resources={[
                {
                  name: 'blog_posts',
                  list: '/blog-posts',
                  create: '/blog-posts/create',
                  edit: '/blog-posts/edit/:id',
                  show: '/blog-posts/show/:id',
                  meta: {
                    canDelete: true,
                  },
                },
                {
                  name: 'categories',
                  list: '/categories',
                  create: '/categories/create',
                  edit: '/categories/edit/:id',
                  show: '/categories/show/:id',
                  meta: {
                    canDelete: true,
                  },
                },
              ]}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                projectId: 'Y5vcQE-ileuXW-VD8mza',
              }}
            >
              <Routes>
                <Route
                  element={
                    <Layout>
                      <Outlet />
                    </Layout>
                  }
                >
                  <Route index element={<NavigateToResource resource="blog_posts" />} />
                  <Route path="/blog-posts">
                    <Route index element={<BlogPostList />} />
                    <Route path="create" element={<BlogPostCreate />} />
                    <Route path="edit/:id" element={<BlogPostEdit />} />
                    <Route path="show/:id" element={<BlogPostShow />} />
                  </Route>
                  <Route path="/categories">
                    <Route index element={<CategoryList />} />
                    <Route path="create" element={<CategoryCreate />} />
                    <Route path="edit/:id" element={<CategoryEdit />} />
                    <Route path="show/:id" element={<CategoryShow />} />
                  </Route>
                  <Route path="*" element={<ErrorComponent />} />
                </Route>
              </Routes>

              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
            <DevtoolsPanel />
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
