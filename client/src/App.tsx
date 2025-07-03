import React, { useState, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { useQuery, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// --- UI Components (Simplified Imports) ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast, Toaster } from "@/components/ui/use-toast";
import { Bot, LogOut, Shield, User as UserIcon } from "lucide-react";

// --- API & State Management ---
const queryClient = new QueryClient();

async function apiRequest(method: string, url: string, data?: unknown) {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }
  return res.json();
}

const getQueryFn = ({ queryKey }: { queryKey: readonly unknown[] }) => {
    return fetch(queryKey[0] as string).then(res => {
        if (res.status === 401) return null;
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
    });
};