
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Facebook, Github, Instagram, Linkedin } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

export default function DeveloperContact() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developer Contact</h1>
        <p className="text-muted-foreground">
          Get to know the developer behind VoteSphere
        </p>
      </div>

      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 z-0" />
        
        <CardHeader className="text-center relative z-10">
          <CardTitle className="text-2xl">Neela Yaswanth</CardTitle>
          <CardDescription className="text-lg">
            Student at Akshaya College of Engineering and Technology
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="flex flex-col items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="rounded-full border-4 border-primary/20 shadow-xl mb-6"
            >
              <Avatar className="h-48 w-48">
                <AvatarImage src="/lovable-uploads/488516df-0db0-4e2c-98ba-b3842a0dccdb.png" alt="Neela Yaswanth" />
                <AvatarFallback className="text-4xl">NY</AvatarFallback>
              </Avatar>
            </motion.div>

            <div className="text-center mb-8 max-w-lg mx-auto">
              <p className="text-muted-foreground">
                Passionate programmer and developer with interests in web development, e-governance, and secure voting systems. 
                Currently pursuing education in technology and making a positive impact through software development.
              </p>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" asChild className="gap-2 hover:bg-secondary/20 hover:text-primary">
                  <a href="https://www.instagram.com/the__real_yash_/" target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                </Button>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" asChild className="gap-2 hover:bg-secondary/20 hover:text-primary">
                  <a href="https://www.linkedin.com/in/neela-yaswanth-220b492b9/" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                </Button>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" asChild className="gap-2 hover:bg-secondary/20 hover:text-primary">
                  <a href="https://www.facebook.com/n.yaswanth" target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                </Button>
              </motion.div>

              <motion.div whileHover={{ y: -5 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" asChild className="gap-2 hover:bg-secondary/20 hover:text-primary">
                  <a href="https://github.com/Neelayaswanth" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5 z-0" />
        
        <CardHeader className="relative z-10">
          <CardTitle>About VoteSphere</CardTitle>
          <CardDescription>
            A secure e-voting platform
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="space-y-4">
            <p>
              VoteSphere is a secure, transparent and user-friendly electronic voting platform designed to make the democratic process more accessible and efficient.
            </p>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Key Features:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Secure user authentication and verification</li>
                <li>Real-time voting and election monitoring</li>
                <li>Transparent and reliable vote counting</li>
                <li>Comprehensive dashboard for voters and administrators</li>
                <li>Support center for addressing concerns</li>
              </ul>
            </div>
            
            <p className="text-muted-foreground mt-4">
              Developed as a project to demonstrate the potential of modern web technologies in improving democratic processes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
