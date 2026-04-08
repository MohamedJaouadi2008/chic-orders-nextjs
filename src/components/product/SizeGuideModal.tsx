"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-light tracking-wide">
            Guide des Tailles
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6 pr-4">
            {/* Letter Sizes */}
            <div>
              <h3 className="text-sm uppercase tracking-widest text-foreground mb-3">
                Tailles Lettres (Hauts & Lingerie)
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Taille</th>
                    <th className="text-left py-2 font-medium">Tour de Poitrine</th>
                    <th className="text-left py-2 font-medium">Tour de Taille</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">XS</td>
                    <td className="py-2">80-84 cm</td>
                    <td className="py-2">60-64 cm</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">S</td>
                    <td className="py-2">84-88 cm</td>
                    <td className="py-2">64-68 cm</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">M</td>
                    <td className="py-2">88-92 cm</td>
                    <td className="py-2">68-72 cm</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">L</td>
                    <td className="py-2">92-96 cm</td>
                    <td className="py-2">72-76 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2">XL</td>
                    <td className="py-2">96-100 cm</td>
                    <td className="py-2">76-80 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Number Sizes */}
            <div>
              <h3 className="text-sm uppercase tracking-widest text-foreground mb-3">
                Tailles Chiffrées (Bas & Pièces Ajustées)
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Taille</th>
                    <th className="text-left py-2 font-medium">Tour de Hanches</th>
                    <th className="text-left py-2 font-medium">Tour de Taille</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <td className="py-2">34</td>
                    <td className="py-2">84-88 cm</td>
                    <td className="py-2">60-64 cm</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">36</td>
                    <td className="py-2">88-92 cm</td>
                    <td className="py-2">64-68 cm</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">38</td>
                    <td className="py-2">92-96 cm</td>
                    <td className="py-2">68-72 cm</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">40</td>
                    <td className="py-2">96-100 cm</td>
                    <td className="py-2">72-76 cm</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2">42</td>
                    <td className="py-2">100-104 cm</td>
                    <td className="py-2">76-80 cm</td>
                  </tr>
                  <tr>
                    <td className="py-2">44</td>
                    <td className="py-2">104-108 cm</td>
                    <td className="py-2">80-84 cm</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tips */}
            <div className="bg-muted/10 p-4 rounded text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Conseils</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Mesurez-vous sans vêtements ou en sous-vêtements légers</li>
                <li>Tenez le ruban bien horizontal</li>
                <li>En cas de doute, optez pour la taille supérieure</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
